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
import { collectionTask } from "./collection/main";
import { StockService } from "./stock";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3800;

const stockService = new StockService();

app.get("/stock/getAllStocks", (req: Request, res: Response) => {
  stockService.getAllStocks(req.params.date).then((v) => res.send(v));
});

app.get("/stock/getStockHistories", (req: Request, res: Response) => {
  if (!req.params.symbol) {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService.getStockHistories(req.params.symbol).then((v) => res.send(v));
});

app.get("/stock/getStockDaily", (req: Request, res: Response) => {
  if (!req.params.symbol) {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService
    .getStockDaily(req.params.symbol, req.params.date)
    .then((v) => res.send(v));
});

app.get("/stock/getStockTradeInfo", (req: Request, res: Response) => {
  if (!req.params.symbol) {
    res.send({ data: null, msg: "Empty symbol" });
    return;
  }
  stockService.getStockTradeInfo(req.params.symbol).then((v) => res.send(v));
});

app.post("/collection/start", (req: Request, res: Response) => {
  if (!job) {
    runCollectionJob();
  }
  res.send({ data: true });
});

app.post("/collection/stop", (req: Request, res: Response) => {
  let cancel = true;
  if (job) {
    cancel = job.cancel();
  }
  res.send({ data: cancel });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to quant");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  runCollectionJob();
});

let job: Job;

function runCollectionJob() {
  console.log(`runCollectionJob ...`);

  initPath();

  logger.setFilePath(path.resolve(logRootPath, "collection.log"));
  // 每天晚上 22 点
  const rule = new RecurrenceRule();
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = 23;
  rule.minute = 12;
  job = scheduleJob(rule, collectionTask);
  // collectionTask();

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
}
