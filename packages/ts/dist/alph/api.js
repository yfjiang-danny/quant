"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALPH_API = void 0;
var axios_1 = __importDefault(require("axios"));
var url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo";
var ALPH_API;
(function (ALPH_API) {
    function request(params) {
        var query = [];
        Object.keys(params).forEach(function (k) {
            query.push("".concat(k, "=").concat(params[k]));
        });
        return axios_1.default
            .get("".concat(process.env.ALPH_API, "?apikey=").concat(process.env.ALPH_TOKEN, "&").concat(query.join("&")), {
            headers: { "User-Agent": "request" },
        })
            .then(function (res) {
            if (res.data) {
                return res.data;
            }
            return null;
        });
    }
    function getStockDaily(symbol) {
        return request({
            function: "TIME_SERIES_DAILY",
            symbol: symbol,
            outputsize: "compact",
        }).then(function (res) {
            if (res) {
                var data_1 = res["Time Series (Daily)"];
                var dates = Object.keys(data_1);
                var stocks_1 = [];
                dates.forEach(function (date) {
                    var stock = {
                        code: symbol,
                        date: date.replace(/-/gi, ""),
                    };
                    var v = data_1[date];
                    if (v) {
                        var keys = Object.keys(v);
                        keys.forEach(function (key) {
                            if (key.includes("open") && v[key]) {
                                stock.open = Number(v[key]);
                                return;
                            }
                            if (key.includes("close") && v[key]) {
                                stock.close = Number(v[key]);
                                return;
                            }
                            if (key.includes("high") && v[key]) {
                                stock.high = Number(v[key]);
                                return;
                            }
                            if (key.includes("low") && v[key]) {
                                stock.low = Number(v[key]);
                                return;
                            }
                            if (key.includes("volume") && v[key]) {
                                stock.volume = Number(v[key]);
                                return;
                            }
                        });
                    }
                    stocks_1.push(stock);
                });
                return stocks_1;
            }
            return null;
        });
    }
    ALPH_API.getStockDaily = getStockDaily;
    function getCompanyOverview(symbol) {
        return request({
            function: "OVERVIEW",
            symbol: symbol,
        });
    }
    ALPH_API.getCompanyOverview = getCompanyOverview;
    /**
     *
     * @param symbol
     * @param period
     * @returns
     */
    function getSMA(_a) {
        var symbol = _a.symbol, _b = _a.period, period = _b === void 0 ? 5 : _b, _c = _a.series_type, series_type = _c === void 0 ? "close" : _c, _d = _a.interval, interval = _d === void 0 ? "daily" : _d;
        return request({
            function: "SMA",
            symbol: symbol,
            interval: interval,
            time_period: period,
            series_type: series_type,
        });
    }
    ALPH_API.getSMA = getSMA;
})(ALPH_API || (exports.ALPH_API = ALPH_API = {}));
