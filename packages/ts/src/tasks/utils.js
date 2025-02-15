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
exports.drawCodeToImg = exports.fillAllStockSMA = exports.fillEastStockInfo = void 0;
var logs_1 = require("../logs");
var api_1 = require("../third/eastmoney/api");
var sma_1 = require("../service/factors/sma");
var fs_1 = require("../utils/fs");
var path_1 = require("path");
var paths_1 = require("../common/paths");
var moment_1 = require("moment");
var canvas_1 = require("../utils/canvas");
function getMarket(symbol) {
    switch (symbol.slice(0, 1)) {
        case "0":
        case "3":
            return "SZ";
        case "6":
            return "SH";
        default:
            return "OC";
    }
}
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
                    len = Math.round(stocks.length / batch);
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
                                            promises_1.push(api_1.EastMoney_API.getStockInfo(v.symbol, getMarket(v.symbol)));
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
/**
 * Use alph api to calculate sma and filled to stock
 */
function fillAllStockSMA(stocks) {
    return __awaiter(this, void 0, void 0, function () {
        var res, len, i, _loop_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logs_1.logger.info("fillAllStockSMA start...");
                    res = [];
                    len = Math.round(stocks.length / batch);
                    i = 0;
                    _loop_2 = function () {
                        var arr, promises_2, responses;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    arr = stocks.slice(i * batch, (i + 1) * batch);
                                    if (!(arr.length > 0)) return [3 /*break*/, 2];
                                    promises_2 = [];
                                    arr.forEach(function (v) {
                                        // @ts-ignore
                                        promises_2.push((0, sma_1.fillStockSMA)(v));
                                    });
                                    return [4 /*yield*/, Promise.all(promises_2)];
                                case 1:
                                    responses = _b.sent();
                                    responses.forEach(function (v, i) {
                                        if (v) {
                                            res.push(__assign(__assign({}, arr[i]), v));
                                        }
                                        else {
                                            res.push(__assign({}, arr[i]));
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
                    return [5 /*yield**/, _loop_2()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    logs_1.logger.info("fillAllStockSMA finished...");
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.fillAllStockSMA = fillAllStockSMA;
function drawCodeToImg(stocks, fileDir) {
    var defaultFileDir = path_1.default.resolve(paths_1.imgRootPath, (0, moment_1.default)().format("YYYYMMDD"));
    var dir = fileDir || defaultFileDir;
    return new Promise(function (resolve, reject) {
        if (stocks.length <= 0) {
            resolve(undefined);
        }
        (0, fs_1.createDir)(dir)
            .then(function () {
            var promise = [];
            var newArr = Array.from(stocks);
            var i = 0;
            while (newArr.length > 0) {
                i++;
                promise.push((0, canvas_1.drawTable)([
                    // { key: "name", name: "股票名称", width: 140 },
                    { key: "symbol", name: "股票代码", width: 140 },
                ], newArr.splice(0, 15), "".concat(i), dir));
            }
            Promise.allSettled(promise)
                .then(function (res) {
                var files = res.reduce(function (res, cur) {
                    if (cur.status === "fulfilled") {
                        if (typeof cur.value === "string") {
                            res.push(cur.value);
                        }
                    }
                    return res;
                }, []);
                resolve(files);
            })
                .catch(function (e) {
                reject(e);
            });
        })
            .catch(function (e) {
            //
            reject(e);
        });
    });
}
exports.drawCodeToImg = drawCodeToImg;
