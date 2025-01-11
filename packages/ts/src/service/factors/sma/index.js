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
exports.fillStocksSMA = exports.fillStockSMA = exports.calculateMovingAverage = exports.calculateIntervalAverage = void 0;
var path_1 = require("path");
var paths_1 = require("../../../common/paths");
var logs_1 = require("../../../logs");
var storage_1 = require("../../storage/storage");
var p_limit_1 = require("p-limit");
var logPath = path_1.default.resolve(paths_1.logRootPath, "sma.log");
function calculateIntervalAverage(histories, interval) {
    if (histories.length < interval) {
        return null;
    }
    return calculateAverage(histories.slice(0, interval));
}
exports.calculateIntervalAverage = calculateIntervalAverage;
function calculateAverage(histories) {
    var i = 0, count = 0, sum = 0;
    while (i < histories.length) {
        var stock = histories[i];
        var close_1 = Number(stock.close);
        if (!isNaN(close_1)) {
            sum += close_1;
            count++;
        }
        i++;
    }
    return Number((sum / count).toFixed(2));
}
/**
 * 计算移动平均数
 * @param histories 股票数据，最新日期在前面
 * @param interval 间隔, 5——5日线 ...
 * @returns
 */
function calculateMovingAverage(histories, interval) {
    var _a, _b;
    var result = [];
    // 检查输入有效性
    if (interval <= 0 || histories.length === 0) {
        return histories;
    }
    for (var i = 0; i < histories.length; i++) {
        var currentDateStock = histories[i];
        // 如果当前索引加上间隔数超过数组长度，则无法计算移动平均数
        if (i + interval > histories.length) {
            result.push(__assign(__assign({}, currentDateStock), (_a = {}, _a["sma".concat(interval)] = null, _a)));
            continue;
        }
        var sum = 0;
        var validCount = 0;
        for (var j = 0; j < interval; j++) {
            var closeValue = Number(histories[i + j].close);
            if (!isNaN(closeValue)) {
                sum += closeValue;
                validCount++;
            }
        }
        var smaValue = validCount > 0 ? sum / validCount : null;
        result.push(__assign(__assign({}, currentDateStock), (_b = {}, _b["sma".concat(interval)] = smaValue, _b)));
    }
    return result;
}
exports.calculateMovingAverage = calculateMovingAverage;
function fillStockSMA(stock) {
    return __awaiter(this, void 0, void 0, function () {
        var symbol, histories, findIndex;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!stock.symbol) {
                        return [2 /*return*/, stock];
                    }
                    symbol = stock.symbol;
                    return [4 /*yield*/, storage_1.Storage.getStockHistoriesFromDB(symbol, 120).then(function (res) {
                            if (res.msg) {
                                console.log(res.msg);
                            }
                            return res.data;
                        })];
                case 1:
                    histories = _g.sent();
                    if (!histories) {
                        return [2 /*return*/, stock];
                    }
                    findIndex = histories.findIndex(function (v) { return v.date === stock.date; });
                    if (findIndex === -1) {
                        if (histories[0].date &&
                            stock.date &&
                            Number(stock.date) > Number(histories[0].date)) {
                            histories.unshift(stock);
                            findIndex = 0;
                        }
                        else {
                            return [2 /*return*/, stock];
                        }
                    }
                    histories = histories.slice(findIndex);
                    if (histories.length < 5) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma5) {
                        stock.sma5 = (_a = calculateIntervalAverage(histories, 5)) !== null && _a !== void 0 ? _a : undefined;
                    }
                    if (histories.length < 10) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma10) {
                        stock.sma10 = (_b = calculateIntervalAverage(histories, 10)) !== null && _b !== void 0 ? _b : undefined;
                    }
                    if (histories.length < 20) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma20) {
                        stock.sma20 = (_c = calculateIntervalAverage(histories, 20)) !== null && _c !== void 0 ? _c : undefined;
                    }
                    if (histories.length < 30) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma30) {
                        stock.sma30 = (_d = calculateIntervalAverage(histories, 30)) !== null && _d !== void 0 ? _d : undefined;
                    }
                    if (histories.length < 60) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma60) {
                        stock.sma60 = (_e = calculateIntervalAverage(histories, 60)) !== null && _e !== void 0 ? _e : undefined;
                    }
                    if (histories.length < 120) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma120) {
                        stock.sma120 =
                            (_f = calculateIntervalAverage(histories, 120)) !== null && _f !== void 0 ? _f : undefined;
                    }
                    return [2 /*return*/, stock];
            }
        });
    });
}
exports.fillStockSMA = fillStockSMA;
/**
 *
 * @param stocks
 * @returns
 */
function fillStocksSMA(stocks) {
    logs_1.logger.info("fillAllStockSMA start...", logPath);
    var limit = (0, p_limit_1.default)(20);
    var promises = stocks.map(function (v) { return limit(function () { return fillStockSMA(v); }); });
    // const promises: Promise<StockWithSMA>[] = [];
    // stocks.forEach((v) => {
    //   promises.push(fillStockSMA(v as CoreModel));
    // });
    return Promise.allSettled(promises).then(function (responses) {
        var res = [];
        responses.forEach(function (v, i) {
            if (v.status === "fulfilled" && v.value) {
                res.push(__assign(__assign({}, stocks[i]), v.value));
            }
            else {
                res.push(__assign({}, stocks[i]));
            }
        });
        logs_1.logger.info("fillAllStockSMA finished...", logPath);
        return res;
    });
}
exports.fillStocksSMA = fillStocksSMA;
