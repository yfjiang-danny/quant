"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EastMoney_API = void 0;
var axios_1 = require("axios");
var path_1 = require("path");
var paths_1 = require("../../common/paths");
var logs_1 = require("../../logs");
var mock_1 = require("./mock");
// https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot
var EastMoney_API;
(function (EastMoney_API) {
    var logOutput = path_1.default.resolve(paths_1.logRootPath, "east_money_api.log");
    function getQuoteSnapshot(symbol, market) {
        var callbackKey = "jQueryH";
        var timestamp = new Date().getTime();
        if (process.env.TEST) {
            logs_1.logger.info("process.env.TEST is ".concat(process.env.TEST, ", use mock data."));
            return new Promise(function (resolve) {
                resolve(mock_1.MockEastMoneyData.find(function (v) { return v.code === symbol; }) || null);
            });
        }
        return axios_1.default
            .get("".concat(process.env.EASTMONEY_API, "?id=").concat(symbol, "&market=").concat(market, "&DC_APP_KEY=dcquotes-service-tweb&DC_TIMESTAMP=").concat(timestamp, "&DC_SIGN=81160C38A19B3006FD96BC54300AD889&callback=").concat(callbackKey, "&_=").concat(timestamp + 1))
            .then(function (res) {
            if (res.status == 200) {
                try {
                    var jsonStr = res.data.slice(callbackKey.length + 1, res.data.length - 2);
                    var data = JSON.parse(jsonStr);
                    return data;
                }
                catch (error) {
                    return null;
                }
            }
            return null;
        })
            .catch(function (e) {
            console.log(e);
            return null;
        });
    }
    EastMoney_API.getQuoteSnapshot = getQuoteSnapshot;
    function getStockInfo(symbol, market) {
        return getQuoteSnapshot(symbol, market)
            .then(function (res) {
            if (res) {
                var close_1 = Number(res.realtimequote.currentPrice);
                var volume = Number(res.realtimequote.volume);
                var turnover = Number(res.realtimequote.turnover.slice(0, res.realtimequote.turnover.length - 1));
                var avg = Number(res.realtimequote.avg);
                var capital = ((volume / (turnover / 100)) * close_1) / Math.pow(10, 6);
                return {
                    high: Number(res.realtimequote.high),
                    low: Number(res.realtimequote.low),
                    capital: capital,
                    close: close_1,
                    open: Number(res.realtimequote.open),
                    avg: avg,
                    code: res.code,
                    date: res.realtimequote.date,
                    time: res.realtimequote.time,
                    name: res.name,
                    turnover: turnover,
                    volume: volume,
                    topPrice: Number(res.topprice),
                    bottomPrice: Number(res.bottomprice),
                    change: res.realtimequote.zd,
                    internal: res.realtimequote.np,
                    external: res.realtimequote.wp,
                    sale1: res.fivequote.sale1,
                    sale2: res.fivequote.sale2,
                    sale1_count: res.fivequote.sale1_count,
                    sale2_count: res.fivequote.sale2_count,
                    buy1: res.fivequote.buy1,
                    buy2: res.fivequote.buy2,
                    buy1_count: res.fivequote.buy1_count,
                    buy2_count: res.fivequote.buy2_count,
                };
            }
            return null;
        })
            .catch(function (err) {
            logs_1.logger.info(err, logOutput);
            return null;
        });
    }
    EastMoney_API.getStockInfo = getStockInfo;
    function getStockCapitalFlow(symbol, market) {
        var callbackKey = "jQuery1123009847759407393886";
        var timestamp = new Date().getTime();
        // if (process.env.TEST) {
        //   logger.info(`process.env.TEST is ${process.env.TEST}, use mock data.`);
        //   return new Promise<QuoteSnapshotModel | null>((resolve) => {
        //     resolve(MockEastMoneyData.find((v) => v.code === symbol) || null);
        //   });
        // }
        return axios_1.default
            .get("".concat(process.env.EASTMONEY_API, "?fltt=2&secids=").concat(symbol, "&fields=f62%2Cf184%2Cf66%2Cf69%2Cf72%2Cf75%2Cf78%2Cf81%2Cf84%2Cf87%2Cf64%2Cf65%2Cf70%2Cf71%2Cf76%2Cf77%2Cf82%2Cf83%2Cf164%2Cf166%2Cf168%2Cf170%2Cf172%2Cf252%2Cf253%2Cf254%2Cf255%2Cf256%2Cf124%2Cf6%2Cf278%2Cf279%2Cf280%2Cf281%2Cf282&ut=b2884a393a59ad64002292a3e90d46a5&cb=").concat(callbackKey, "_").concat(timestamp, "&_=").concat(timestamp + 1))
            .then(function (res) {
            if (res.status == 200) {
                try {
                    var jsonStr = res.data.slice(callbackKey.length + 1, res.data.length - 2);
                    var data = JSON.parse(jsonStr);
                    return data;
                }
                catch (error) {
                    return null;
                }
            }
            return null;
        })
            .catch(function (e) {
            console.log(e);
            return null;
        });
    }
    EastMoney_API.getStockCapitalFlow = getStockCapitalFlow;
})(EastMoney_API || (exports.EastMoney_API = EastMoney_API = {}));
