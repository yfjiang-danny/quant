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
exports.fillStockSMA = exports.calculateMovingAverage = void 0;
var api_1 = require("../alph/api");
/**
 * 计算移动平均数
 * @param stocks 股票数据，最新日期在前面
 * @param interval 间隔, 5——5日线 ...
 * @returns
 */
function calculateMovingAverage(stocks, interval) {
    var _a, _b;
    var result = [];
    // 检查输入有效性
    if (interval <= 0 || stocks.length === 0) {
        return result;
    }
    for (var i = 0; i < stocks.length; i++) {
        var currentDateStock = stocks[i];
        // 如果当前索引加上间隔数超过数组长度，则无法计算移动平均数
        if (i + interval > stocks.length) {
            result.push(__assign(__assign({}, currentDateStock), (_a = { close: currentDateStock.close }, _a["sma".concat(interval)] = null, _a)));
            continue;
        }
        var sum = 0;
        var validCount = 0;
        for (var j = 0; j < interval; j++) {
            var closeValue = stocks[i + j].close;
            if (typeof closeValue === "number") {
                sum += closeValue;
                validCount++;
            }
        }
        var smaValue = validCount > 0 ? sum / validCount : null;
        result.push(__assign(__assign({}, currentDateStock), (_b = { close: currentDateStock.close }, _b["sma".concat(interval)] = smaValue, _b)));
    }
    return result;
}
exports.calculateMovingAverage = calculateMovingAverage;
function fillStockSMA(stock) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function () {
        var symbol, histories;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!stock.symbol || !stock.exchange) {
                        return [2 /*return*/, stock];
                    }
                    symbol = stock.symbol + "." + stock.exchange;
                    return [4 /*yield*/, api_1.ALPH_API.getStockDaily(symbol)];
                case 1:
                    histories = _g.sent();
                    if (!histories) {
                        return [2 /*return*/, stock];
                    }
                    if (!stock.sma5) {
                        stock.sma5 = (_a = calculateMovingAverage(histories, 5).find(function (v) { return v.date === stock.date; })) === null || _a === void 0 ? void 0 : _a.sma5;
                    }
                    if (!stock.sma10) {
                        stock.sma10 = (_b = calculateMovingAverage(histories, 10).find(function (v) { return v.date === stock.date; })) === null || _b === void 0 ? void 0 : _b.sma10;
                    }
                    if (!stock.sma20) {
                        stock.sma20 = (_c = calculateMovingAverage(histories, 20).find(function (v) { return v.date === stock.date; })) === null || _c === void 0 ? void 0 : _c.sma20;
                    }
                    if (!stock.sma30) {
                        stock.sma30 = (_d = calculateMovingAverage(histories, 30).find(function (v) { return v.date === stock.date; })) === null || _d === void 0 ? void 0 : _d.sma30;
                    }
                    if (!stock.sma60) {
                        stock.sma60 = (_e = calculateMovingAverage(histories, 60).find(function (v) { return v.date === stock.date; })) === null || _e === void 0 ? void 0 : _e.sma60;
                    }
                    if (!stock.sma120) {
                        stock.sma120 = (_f = calculateMovingAverage(histories, 120).find(function (v) { return v.date === stock.date; })) === null || _f === void 0 ? void 0 : _f.sma120;
                    }
                    return [2 /*return*/, stock];
            }
        });
    });
}
exports.fillStockSMA = fillStockSMA;
