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
exports.calcBottomPriceLimit = exports.calcTopPriceLimit = exports.getLimitPercentage = exports.convertToHistoryTimeModel = exports.convertToHistoryModel = exports.fillStockHistoryByALPH = exports.fillEastStockInfo = void 0;
var logs_1 = require("../../logs");
var convert_1 = require("../../utils/convert");
var api_1 = require("../../third/alph/api");
var api_2 = require("../../third/eastmoney/api");
var storage_1 = require("../storage/storage");
var batch = 10;
/**
 * Use east money api to fill stock info
 * @param stocks
 * @returns
 */
function fillEastStockInfo(stocks) {
    return __awaiter(this, void 0, void 0, function () {
        var res, len, i, _loop_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logs_1.logger.info("fillEastStockInfo start...\n");
                    res = [];
                    len = Math.ceil(stocks.length / batch);
                    i = 0;
                    _loop_1 = function () {
                        var from, to, arr, promises_1, responses;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    from = i * batch;
                                    to = from + batch;
                                    arr = stocks.slice(from, to);
                                    if (!(arr.length > 0)) return [3 /*break*/, 2];
                                    promises_1 = [];
                                    arr.forEach(function (v) {
                                        if (v.symbol) {
                                            promises_1.push(api_2.EastMoney_API.getStockInfo(v.symbol, (0, convert_1.getMarket)(v.symbol)));
                                        }
                                        else {
                                            promises_1.push(new Promise(function (resolve) {
                                                resolve(null);
                                            }));
                                        }
                                    });
                                    logs_1.logger.info("batch ".concat(i, ": [").concat(from, ", ").concat(to, "], total ").concat(len));
                                    return [4 /*yield*/, Promise.all(promises_1)];
                                case 1:
                                    responses = _b.sent();
                                    responses.forEach(function (v, j) {
                                        if (v) {
                                            res.push(__assign(__assign({}, arr[j]), v));
                                        }
                                        else {
                                            res.push(__assign({}, arr[j]));
                                        }
                                    });
                                    _b.label = 2;
                                case 2:
                                    i++;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!(i < len)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    logs_1.logger.info("fillEastStockInfo finished");
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.fillEastStockInfo = fillEastStockInfo;
function fillStockHistoryByALPH(stock) {
    return new Promise(function (resolve) {
        if (stock.ts_code) {
            api_1.ALPH_API.getStockDaily(stock.ts_code).then(function (histories) {
                if (histories) {
                    storage_1.Storage.saveStocks(histories.map(function (v) { return (__assign({ v: v }, stock)); }))
                        .then(function (res) {
                        if (res.msg) {
                            console.log(res.msg);
                        }
                    })
                        .catch(function (e) {
                        console.log(e);
                    })
                        .finally(function () { return resolve(true); });
                }
                else {
                    resolve(true);
                }
            }, function (e) {
                console.log(e);
                resolve(true);
            });
        }
        else {
            resolve(true);
        }
    });
}
exports.fillStockHistoryByALPH = fillStockHistoryByALPH;
function convertToHistoryModel(v) {
    function toString(v) {
        return v ? String(v) : null;
    }
    return {
        date: v.date,
        time: v.time,
        name: v.name,
        symbol: v.symbol,
        change: v.change,
        close: toString(v.close),
        open: toString(v.open),
        high: toString(v.high),
        low: toString(v.low),
        avg: toString(v.avg),
        top_price: toString(v.topPrice),
        bottom_price: toString(v.bottomPrice),
        turnover: toString(v.turnover),
        volume: toString(v.volume),
        external: v.external,
        internal: v.internal,
        buy1: v.buy1,
        buy2: v.buy2,
        sale1: v.sale1,
        sale2: v.sale2,
        sale1_count: v.sale1_count,
        sale2_count: v.sale2_count,
        buy1_count: v.buy1_count,
        buy2_count: v.buy2_count,
    };
}
exports.convertToHistoryModel = convertToHistoryModel;
function convertToHistoryTimeModel(v) {
    function toString(v) {
        return v ? String(v) : null;
    }
    return {
        date: v.date,
        time: v.time,
        name: v.name,
        symbol: v.symbol,
        change: v.change,
        close: toString(v.close),
        open: toString(v.open),
        high: toString(v.high),
        low: toString(v.low),
        avg: toString(v.avg),
        top_price: toString(v.topPrice),
        bottom_price: toString(v.bottomPrice),
        turnover: toString(v.turnover),
        volume: toString(v.volume),
        external: v.external,
        internal: v.internal,
        buy1: v.buy1,
        buy2: v.buy2,
        sale1: v.sale1,
        sale2: v.sale2,
        sale1_count: v.sale1_count,
        sale2_count: v.sale2_count,
        buy1_count: v.buy1_count,
        buy2_count: v.buy2_count,
    };
}
exports.convertToHistoryTimeModel = convertToHistoryTimeModel;
function getLimitPercentage(symbol) {
    if (!symbol)
        return 0;
    return (symbol === null || symbol === void 0 ? void 0 : symbol.startsWith("0")) || (symbol === null || symbol === void 0 ? void 0 : symbol.startsWith("60"))
        ? 0.1
        : (symbol === null || symbol === void 0 ? void 0 : symbol.startsWith("8")) || (symbol === null || symbol === void 0 ? void 0 : symbol.startsWith("4"))
            ? 0.3
            : 0.2;
}
exports.getLimitPercentage = getLimitPercentage;
function calcTopPriceLimit(stock) {
    var close = Number(stock.close);
    var maxChange = getLimitPercentage(stock.symbol);
    return (close * (1 + maxChange)).toFixed(2);
}
exports.calcTopPriceLimit = calcTopPriceLimit;
function calcBottomPriceLimit(stock) {
    var close = Number(stock.close);
    var maxChange = getLimitPercentage(stock.symbol);
    return (close * (1 - maxChange)).toFixed(2);
}
exports.calcBottomPriceLimit = calcBottomPriceLimit;
