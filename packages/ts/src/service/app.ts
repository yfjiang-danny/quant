import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  Job,
  RecurrenceRule,
  gracefulShutdown,
  scheduleJob,
} from "node-schedule";
import path from "path";
import { initPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { filterCurrent } from "../tasks/filterCurrent";
import { filterStocks } from "../tasks/filterStocks";
import { collectionTask } from "../collection/collection";
import { StockService } from "./stock";
import { filterLadder } from "../tasks/filterLadder";
import { dailyCollection } from "../collection/collection.next";
import { genReport } from "../tasks/genReport";
import {
  time15Collection,
  time20Collection,
  time25Collection,
  time30Collection,
} from "../collection/collection.time";
import { buyEntrustmentTask, buyPlanTask } from "../tasks/simulation";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3800;

const stockService = new StockService();

app.get("/stock/getAllStocks", (req: Request, res: Response) => {
  console.log(`get /stock/getAllStocks`);

  stockService.getAllStocks(req.query.date as string).then((v) => res.send(v));
});

app.get("/stock/getStockHistories", (req: Request, res: Response) => {
  console.log(`/stock/getStockHistories ${req.query}`);

  if (typeof req.query.symbol !== "string") {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService.getStockHistories(req.query.symbol).then((v) => res.send(v));
});

app.get("/stock/getStockDaily", (req: Request, res: Response) => {
  console.log(`/stock/getStockDaily ${req.query}`);

  if (typeof req.query.symbol !== "string") {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService
    .getStockDaily(req.query.symbol, req.query.date as string)
    .then((v) => res.send(v));
});

app.get("/stock/getStockTradeInfo", (req: Request, res: Response) => {
  console.log(`/stock/getStockTradeInfo ${req.query}`);

  if (typeof req.query.symbol !== "string") {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService
    .getStockTradeInfo(req.query.symbol)
    .then((v: any) => res.send(v));
});

app.post("/collection/start", (req: Request, res: Response) => {
  console.log(`/collection/start`);

  if (!job) {
    runCollectionJob();
  }
  res.send({ data: true });
});

app.post("/collection/exec", (req: Request, res: Response) => {
  console.log(`/collection/exec`);

  collectionTask(mailer);
  res.send({ data: true });
});

app.post("/collection/stop", (req: Request, res: Response) => {
  console.log(`/collection/stop`);

  let cancel = true;
  if (job) {
    cancel = job.cancel();
  }
  res.send({ data: cancel });
});

app.post("/db/collection/exec", (req: Request, res: Response) => {
  console.log(`/db/collection/exec`);
  dailyCollection(mailer);
  res.send({ data: true });
});

app.post("/task/filterStocks/start", (req: Request, res: Response) => {
  console.log(`/task/filterStocks/start`);

  if (!filterStocksJob) {
    runFilterStockJob();
  }
  res.send({ data: true });
});

app.post("/task/filterStocks/exec", (req: Request, res: Response) => {
  console.log(`/task/filterStocks/exec`);

  filterStocks(undefined, mailer);
  res.send({ data: true });
});

app.post("/task/filterStocks/stop", (req: Request, res: Response) => {
  console.log(`/task/filterStocks/stop`);

  let cancel = true;
  if (filterStocksJob) {
    cancel = filterStocksJob.cancel();
  }
  res.send({ data: cancel });
});

// app.post("/task/filterCurrent/start", (req: Request, res: Response) => {
//   console.log(`/task/filterCurrent/start`);

//   if (!filterCurrentJob) {
//     runFilterCurrentJob();
//   }
//   res.send({ data: true });
// });

app.post("/task/filterCurrent/exec", (req: Request, res: Response) => {
  console.log(`/task/filterCurrent/exec`);

  filterCurrent(undefined, mailer);
  res.send({ data: true });
});

// app.post("/task/filterCurrent/stop", (req: Request, res: Response) => {
//   console.log(`/task/filterCurrent/stop`);

//   let cancel = true;
//   if (filterCurrentJob) {
//     cancel = filterCurrentJob.cancel();
//   }
//   res.send({ data: cancel });
// });

app.post("/task/filterLadder/start", (req: Request, res: Response) => {
  console.log(`/task/filterLadder/start`);
  filterLadder();
  res.send({ data: true });
});

app.post("/task/genReport/exec", (req: Request, res: Response) => {
  console.log(`/task/genReport/exec`);
  genReport(undefined, mailer);
  res.send({ data: true });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to quant");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  runDBCollectionJob();
  // runCollectionJob();
  runFilterStockJob();
  // runFilterCurrentJob();
  runGenReportJob();

  //
  runSnapshot15Job();
  runSnapshot20Job();
  runSnapshot25Job();
  runSnapshot30Job();

  //
  runBuyPlanJob();
  runBuyEntrustmentJob();
});

let job: Job;

function runCollectionJob() {
  console.log(`Start runCollectionJob ...`);

  initPath();

  logger.setFilePath(path.resolve(logRootPath, "collection.log"));
  // 每天晚上 17 点
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 17;
  rule.minute = 0;
  job = scheduleJob(rule, collectionTask.bind(null, mailer));

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
}

let dbJob: Job;
function runDBCollectionJob() {
  console.log(`Start runDBCollectionJob ...`);

  // 每天晚上 17 点
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 17;
  rule.minute = 0;
  dbJob = scheduleJob(rule, dailyCollection.bind(null, mailer));

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
}

const mailer = new Mailer163();

let filterStocksJob: Job;
function runFilterStockJob() {
  console.log(`Start runFilterStockJob ...`);

  // 每天 17:30
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 18;
  rule.minute = 0;
  const fn = filterStocks.bind(null, undefined, mailer, undefined);
  filterStocksJob = scheduleJob(rule, fn);
}

// let filterCurrentJob: Job;
// function runFilterCurrentJob() {
//   console.log(`Start runFilterCurrentJob ...`);

//   // 每天 14:50
//   const rule = new RecurrenceRule();
//   rule.dayOfWeek = [1, 2, 3, 4, 5];
//   rule.hour = 14;
//   rule.minute = 50;
//   const fn = filterCurrent.bind(null, undefined, mailer, false);
//   filterCurrentJob = scheduleJob(rule, fn);
// }

let genReportJob: Job;
function runGenReportJob() {
  console.log(`Start runFilterStockJob ...`);

  // 每天 17:30
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 18;
  rule.minute = 0;
  const fn = genReport.bind(null, undefined, mailer);
  genReportJob = scheduleJob(rule, fn);
}

function runSnapshot15Job() {
  console.log(`Start Snapshot15 ...`);

  // 每天 09:15
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 15;
  const fn = time15Collection.bind(null, mailer);
  scheduleJob(rule, fn);
}

function runSnapshot20Job() {
  console.log(`Start Snapshot18 ...`);

  // 每天 09:20
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 20;
  const fn = time20Collection.bind(null, mailer);
  scheduleJob(rule, fn);
}

function runSnapshot25Job() {
  console.log(`Start Snapshot25 ...`);

  // 每天 09:25
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 25;
  const fn = time25Collection.bind(null, mailer);
  scheduleJob(rule, fn);
}

function runSnapshot30Job() {
  console.log(`Start Snapshot30 ...`);

  // 每天 09:30
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 30;
  const fn = time30Collection.bind(null, mailer);
  scheduleJob(rule, fn);
}

function runBuyPlanJob() {
  console.log(`Start BuyPlan ...`);

  // 每天 09:20
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 20;
  const fn = buyPlanTask.bind(null);
  scheduleJob(rule, fn);
}

function runBuyEntrustmentJob() {
  console.log(`Start BuyEntrustment ...`);

  // 每天 09:25
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 9;
  rule.minute = 25;
  const fn = buyEntrustmentTask.bind(null);
  scheduleJob(rule, fn);
}
