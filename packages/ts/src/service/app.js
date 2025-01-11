"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var node_schedule_1 = require("node-schedule");
var path_1 = require("path");
var paths_1 = require("../common/paths");
var logs_1 = require("../logs");
var mail_1 = require("../mail");
var filterCurrent_1 = require("../tasks/filterCurrent");
var filterStocks_1 = require("../tasks/filterStocks");
var collection_1 = require("../collection/collection");
var stock_1 = require("./stock");
var filterLadder_1 = require("../tasks/filterLadder");
var collection_next_1 = require("../collection/collection.next");
var genReport_1 = require("../tasks/genReport");
var collection_time_1 = require("../collection/collection.time");
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT || 3800;
var stockService = new stock_1.StockService();
app.get("/stock/getAllStocks", function (req, res) {
    console.log("get /stock/getAllStocks");
    stockService.getAllStocks(req.query.date).then(function (v) { return res.send(v); });
});
app.get("/stock/getStockHistories", function (req, res) {
    console.log("/stock/getStockHistories ".concat(req.query));
    if (typeof req.query.symbol !== "string") {
        res.send({ data: null, msg: "Empty symbol" });
        return;
    }
    stockService.getStockHistories(req.query.symbol).then(function (v) { return res.send(v); });
});
app.get("/stock/getStockDaily", function (req, res) {
    console.log("/stock/getStockDaily ".concat(req.query));
    if (typeof req.query.symbol !== "string") {
        res.send({ data: null, msg: "Empty symbol" });
        return;
    }
    stockService
        .getStockDaily(req.query.symbol, req.query.date)
        .then(function (v) { return res.send(v); });
});
app.get("/stock/getStockTradeInfo", function (req, res) {
    console.log("/stock/getStockTradeInfo ".concat(req.query));
    if (typeof req.query.symbol !== "string") {
        res.send({ data: null, msg: "Empty symbol" });
        return;
    }
    stockService
        .getStockTradeInfo(req.query.symbol)
        .then(function (v) { return res.send(v); });
});
app.post("/collection/start", function (req, res) {
    console.log("/collection/start");
    if (!job) {
        runCollectionJob();
    }
    res.send({ data: true });
});
app.post("/collection/exec", function (req, res) {
    console.log("/collection/exec");
    (0, collection_1.collectionTask)(mailer);
    res.send({ data: true });
});
app.post("/collection/stop", function (req, res) {
    console.log("/collection/stop");
    var cancel = true;
    if (job) {
        cancel = job.cancel();
    }
    res.send({ data: cancel });
});
app.post("/db/collection/exec", function (req, res) {
    console.log("/db/collection/exec");
    (0, collection_next_1.dailyCollection)(mailer);
    res.send({ data: true });
});
app.post("/task/filterStocks/start", function (req, res) {
    console.log("/task/filterStocks/start");
    if (!filterStocksJob) {
        runFilterStockJob();
    }
    res.send({ data: true });
});
app.post("/task/filterStocks/exec", function (req, res) {
    console.log("/task/filterStocks/exec");
    (0, filterStocks_1.filterStocks)(undefined, mailer);
    res.send({ data: true });
});
app.post("/task/filterStocks/stop", function (req, res) {
    console.log("/task/filterStocks/stop");
    var cancel = true;
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
app.post("/task/filterCurrent/exec", function (req, res) {
    console.log("/task/filterCurrent/exec");
    (0, filterCurrent_1.filterCurrent)(undefined, mailer);
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
app.post("/task/filterLadder/start", function (req, res) {
    console.log("/task/filterLadder/start");
    (0, filterLadder_1.filterLadder)();
    res.send({ data: true });
});
app.post("/task/genReport/exec", function (req, res) {
    console.log("/task/genReport/exec");
    (0, genReport_1.genReport)(undefined, mailer);
    res.send({ data: true });
});
app.get("/", function (req, res) {
    res.send("Welcome to quant");
});
app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
    runDBCollectionJob();
    // runCollectionJob();
    runFilterStockJob();
    // runFilterCurrentJob();
    runGenReportJob();
    //
    runSnapshot15Job();
    runSnapshot18Job();
    runSnapshot25Job();
    runSnapshot30Job();
});
var job;
function runCollectionJob() {
    console.log("Start runCollectionJob ...");
    (0, paths_1.initPath)();
    logs_1.logger.setFilePath(path_1.default.resolve(paths_1.logRootPath, "collection.log"));
    // 每天晚上 17 点
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 17;
    rule.minute = 0;
    job = (0, node_schedule_1.scheduleJob)(rule, collection_1.collectionTask.bind(null, mailer));
    process.on("SIGINT", function () {
        (0, node_schedule_1.gracefulShutdown)().then(function () { return process.exit(0); });
    });
}
var dbJob;
function runDBCollectionJob() {
    console.log("Start runDBCollectionJob ...");
    // 每天晚上 17 点
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 17;
    rule.minute = 0;
    dbJob = (0, node_schedule_1.scheduleJob)(rule, collection_next_1.dailyCollection.bind(null, mailer));
    process.on("SIGINT", function () {
        (0, node_schedule_1.gracefulShutdown)().then(function () { return process.exit(0); });
    });
}
var mailer = new mail_1.Mailer163();
var filterStocksJob;
function runFilterStockJob() {
    console.log("Start runFilterStockJob ...");
    // 每天 17:30
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 17;
    rule.minute = 30;
    var fn = filterStocks_1.filterStocks.bind(null, undefined, mailer);
    filterStocksJob = (0, node_schedule_1.scheduleJob)(rule, fn);
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
var genReportJob;
function runGenReportJob() {
    console.log("Start runFilterStockJob ...");
    // 每天 17:30
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 18;
    rule.minute = 0;
    var fn = genReport_1.genReport.bind(null, undefined, mailer);
    genReportJob = (0, node_schedule_1.scheduleJob)(rule, fn);
}
function runSnapshot15Job() {
    console.log("Start Snapshot15 ...");
    // 每天 09:15
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 9;
    rule.minute = 15;
    var fn = collection_time_1.time15Collection.bind(null, mailer);
    genReportJob = (0, node_schedule_1.scheduleJob)(rule, fn);
}
function runSnapshot18Job() {
    console.log("Start Snapshot18 ...");
    // 每天 09:18
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 9;
    rule.minute = 18;
    var fn = collection_time_1.time18Collection.bind(null, mailer);
    genReportJob = (0, node_schedule_1.scheduleJob)(rule, fn);
}
function runSnapshot25Job() {
    console.log("Start Snapshot25 ...");
    // 每天 09:25
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 9;
    rule.minute = 25;
    var fn = collection_time_1.time25Collection.bind(null, mailer);
    genReportJob = (0, node_schedule_1.scheduleJob)(rule, fn);
}
function runSnapshot30Job() {
    console.log("Start Snapshot30 ...");
    // 每天 09:30
    var rule = new node_schedule_1.RecurrenceRule();
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 9;
    rule.minute = 30;
    var fn = collection_time_1.time30Collection.bind(null, mailer);
    genReportJob = (0, node_schedule_1.scheduleJob)(rule, fn);
}
