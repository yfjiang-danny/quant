"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALPH_API = void 0;
var axios_1 = require("axios");
var url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo";
var ALPH_API;
(function (ALPH_API) {
    function request(params) {
        var query = [];
        Object.keys(params).forEach(function (k) {
            query.push("".concat(k, "=").concat(params[k]));
        });
        return axios_1.default.get("".concat(process.env.ALPH_API, "?apikey=").concat(process.env.ALPH_TOKEN, "&").concat(query.join("&")), {
            headers: { "User-Agent": "request" },
        });
    }
    function getStockDaily(symbol) {
        return request({
            function: "TIME_SERIES_DAILY",
            symbol: symbol,
            outputsize: "full",
        });
    }
    ALPH_API.getStockDaily = getStockDaily;
    function getStockDailyAdjusted(symbol) {
        return request({
            function: "TIME_SERIES_DAILY_ADJUSTED",
            symbol: symbol,
            outputsize: "full",
        });
    }
    ALPH_API.getStockDailyAdjusted = getStockDailyAdjusted;
    function getCompanyOverview(symbol) {
        return request({
            function: "OVERVIEW",
            symbol: symbol,
        });
    }
    ALPH_API.getCompanyOverview = getCompanyOverview;
})(ALPH_API || (exports.ALPH_API = ALPH_API = {}));
