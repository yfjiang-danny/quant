"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genReport = void 0;
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
var moment_1 = require("moment");
var storage_1 = require("../service/storage/storage");
var ColumnMap = {
    totalVolume: "总成交量",
    numOfPositive: "上涨数",
    numOfNegative: "下跌数",
    reachTop: "触及涨停",
    reachBottom: "触及跌停",
    topLimitted: "涨停数",
    bottomLimitted: "跌停数",
    median: "中位数",
    between0And1: "0<=1",
    between1And5: "1<=5",
    moreThan5: "5<",
    between0And1Negative: "-1<=0",
    between1And5Negative: "-5<=-1",
    moreThan5Negative: "<=-5",
};
function genReport(date, mail) {
    return __awaiter(this, void 0, void 0, function () {
        var allStocks, stocks, totalVolume, numOfPositive, numOfNegative, reachTop, reachBottom, topLimitted, bottomLimitted, between0And1, between1And5, moreThan5, between0And1Negative, between1And5Negative, moreThan5Negative, _i, stocks_1, stock, changePercentage, median, result, htmlStr, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                        return [2 /*return*/];
                    }
                    date = date !== null && date !== void 0 ? date : (0, moment_1.default)().format("YYYYMMDD");
                    return [4 /*yield*/, storage_1.Storage.getStockDetailsByDate(date).then(function (res) { return res.data; })];
                case 1:
                    allStocks = _a.sent();
                    if (!allStocks || allStocks.length === 0) {
                        return [2 /*return*/];
                    }
                    stocks = allStocks
                        .map(function (v) {
                        return __assign(__assign({}, v), { changePercentage: Number((Number(v.change) / (Number(v.close) - Number(v.change))).toFixed(4)) });
                    })
                        .sort(function (a, b) { return b.changePercentage - a.changePercentage; });
                    totalVolume = 0, numOfPositive = 0, numOfNegative = 0, reachTop = 0, reachBottom = 0, topLimitted = 0, bottomLimitted = 0, between0And1 = 0, between1And5 = 0, moreThan5 = 0, between0And1Negative = 0, between1And5Negative = 0, moreThan5Negative = 0;
                    for (_i = 0, stocks_1 = stocks; _i < stocks_1.length; _i++) {
                        stock = stocks_1[_i];
                        if (!isNaN(Number(stock.volume))) {
                            totalVolume += Number(stock.volume);
                        }
                        if (Number(stock.close) > Number(stock.open)) {
                            numOfPositive++;
                        }
                        else if (Number(stock.close) < Number(stock.open)) {
                            numOfNegative++;
                        }
                        if (Number(stock.high) === Number(stock.top_price)) {
                            reachTop++;
                        }
                        if (Number(stock.low) === Number(stock.bottom_price)) {
                            reachBottom++;
                        }
                        if (Number(stock.close) === Number(stock.top_price)) {
                            topLimitted++;
                        }
                        if (Number(stock.close) === Number(stock.bottom_price)) {
                            bottomLimitted++;
                        }
                        changePercentage = stock.changePercentage;
                        if (!isNaN(changePercentage)) {
                            if (changePercentage > 0 && changePercentage <= 0.01) {
                                between0And1++;
                            }
                            else if (changePercentage > 0.01 && changePercentage <= 0.05) {
                                between1And5++;
                            }
                            else if (changePercentage > 0.05) {
                                moreThan5++;
                            }
                            else if (changePercentage <= 0 && changePercentage > -0.01) {
                                between0And1Negative++;
                            }
                            else if (changePercentage <= -0.01 && changePercentage > -0.05) {
                                between1And5Negative++;
                            }
                            else {
                                moreThan5Negative++;
                            }
                        }
                    }
                    median = 0;
                    if (stocks.length % 2 === 0) {
                        median = stocks[Math.round(stocks.length / 2)].changePercentage;
                    }
                    else {
                        median = Number(((stocks[Math.round(stocks.length / 2)].changePercentage +
                            stocks[Math.round(stocks.length / 2) - 1].changePercentage) /
                            2).toFixed(4));
                    }
                    result = {
                        totalVolume: totalVolume,
                        numOfPositive: numOfPositive,
                        numOfNegative: numOfNegative,
                        reachTop: reachTop,
                        reachBottom: reachBottom,
                        topLimitted: topLimitted,
                        bottomLimitted: bottomLimitted,
                        median: (median * 100).toString() + "%",
                        between0And1: between0And1,
                        between1And5: between1And5,
                        moreThan5: moreThan5,
                        between0And1Negative: between0And1Negative,
                        between1And5Negative: between1And5Negative,
                        moreThan5Negative: moreThan5Negative,
                    };
                    htmlStr = "";
                    for (key in ColumnMap) {
                        if (Object.prototype.hasOwnProperty.call(ColumnMap, key)) {
                            htmlStr += "<br />";
                            htmlStr += ColumnMap[key];
                            htmlStr += "：";
                            htmlStr += result[key];
                        }
                    }
                    if (mail) {
                        mail.send({
                            subject: "市场概览",
                            html: htmlStr,
                        });
                    }
                    return [2 /*return*/, htmlStr];
            }
        });
    });
}
exports.genReport = genReport;
