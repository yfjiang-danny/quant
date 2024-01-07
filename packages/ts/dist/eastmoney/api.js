"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EastMoney_API = void 0;
var axios_1 = __importDefault(require("axios"));
var logs_1 = require("../logs");
// https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot
var EastMoney_API;
(function (EastMoney_API) {
    function getQuoteSnapshot(symbol, market) {
        var callbackKey = "jQueryH";
        var timestamp = new Date().getTime();
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
                logs_1.logger.info(res);
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
                    name: res.name,
                    turnover: turnover,
                    volume: volume,
                };
            }
            return null;
        })
            .catch(function (err) {
            console.log(err);
            return null;
        });
    }
    EastMoney_API.getStockInfo = getStockInfo;
})(EastMoney_API || (exports.EastMoney_API = EastMoney_API = {}));
