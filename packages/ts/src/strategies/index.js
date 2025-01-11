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
exports.Strategies = void 0;
var path_1 = require("path");
var common_1 = require("../common");
var paths_1 = require("../common/paths");
var logs_1 = require("../logs");
var rise_1 = require("../service/factors/rise");
var storage_1 = require("../service/storage/storage");
var util_1 = require("./util");
var sma_1 = require("../service/factors/sma");
var date_1 = require("../utils/date");
var Strategies;
(function (Strategies) {
    var logPath = path_1.default.resolve(paths_1.logRootPath, "strategy.log");
    /**
     * 获取小市值的票, 按照从小到大排序
     * @returns
     */
    function getMinCapitalStocks() {
        return __awaiter(this, arguments, void 0, function (minCapital, date) {
            var allStocks, minCapitalStocks;
            if (minCapital === void 0) { minCapital = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage_1.Storage.getStockDetailsByDate(date).then(function (res) {
                            return res.data;
                        })];
                    case 1:
                        allStocks = _a.sent();
                        if (!allStocks || allStocks.length <= 0) {
                            logs_1.logger.info("Stocks is empty", logPath);
                            return [2 /*return*/];
                        }
                        minCapitalStocks = allStocks
                            .map(function (v) {
                            var nv = __assign({}, v);
                            Object.keys(nv).forEach(function (key) {
                                if (!isNaN(Number(nv[key])) && key !== "symbol" && key !== "date") {
                                    nv[key] = Number(nv[key]);
                                }
                            });
                            nv.capital =
                                ((Number(v.volume) / (Number(v.turnover) / 100)) * Number(v.close)) /
                                    Math.pow(10, 6);
                            return nv;
                        })
                            .filter(function (v) {
                            var symbol = v.symbol;
                            var isFitSymbol = symbol &&
                                (symbol.startsWith("3") ||
                                    symbol.startsWith("60") ||
                                    symbol.startsWith("0"));
                            var capital = v.capital;
                            return isFitSymbol && capital && capital < minCapital;
                        })
                            .sort(function (a, b) { return a.capital - b.capital; });
                        return [2 /*return*/, minCapitalStocks];
                }
            });
        });
    }
    Strategies.getMinCapitalStocks = getMinCapitalStocks;
    /**
     * 十字星, 五日线上方且离五日线振幅不超过 10 个点, 十日线在20日线上方, 换手率在 3~60 之间
     * @returns
     */
    function filterCross(minCapitalStocks) {
        return __awaiter(this, void 0, void 0, function () {
            var crossStocks, filterStocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!minCapitalStocks) return [3 /*break*/, 2];
                        return [4 /*yield*/, getMinCapitalStocks(300)];
                    case 1:
                        minCapitalStocks = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!minCapitalStocks || minCapitalStocks.length <= 0) {
                            logs_1.logger.info("MinCapitalStocks Stocks is empty", logPath);
                            return [2 /*return*/];
                        }
                        crossStocks = minCapitalStocks.filter(function (v) {
                            return (0, util_1.isDownCross)(v) && (0, util_1.fitTurnover)(v, 3, 60);
                        });
                        if (crossStocks.length <= 0) {
                            logs_1.logger.info("crossStocks is empty", logPath);
                            return [2 /*return*/];
                        }
                        filterStocks = crossStocks.filter(function (v) {
                            var bool = true;
                            var close = Number(v.close);
                            if (!close || !v.sma5) {
                                return false;
                            }
                            if (v.sma5) {
                                bool = close >= v.sma5 && (close - v.sma5) / v.sma5 < 0.1; // 偏离五日线 10 个点以内
                            }
                            if (bool && v.sma10 && v.sma20) {
                                bool = v.sma10 > v.sma20;
                            }
                            return bool;
                        });
                        if (filterStocks.length <= 0) {
                            logs_1.logger.info("filterCross -> filterStocks is empty", logPath);
                            return [2 /*return*/];
                        }
                        return [2 /*return*/, filterStocks];
                }
            });
        });
    }
    Strategies.filterCross = filterCross;
    function filterMaxRiseDay(stocks_1) {
        return __awaiter(this, arguments, void 0, function (stocks, day) {
            var filterResult;
            if (day === void 0) { day = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rise_1.fillMaxRiseDay)(stocks)];
                    case 1:
                        filterResult = _a.sent();
                        return [2 /*return*/, filterResult.filter(function (v) {
                                return v.maxRiseDay && v.maxRiseDay >= day;
                            })];
                }
            });
        });
    }
    Strategies.filterMaxRiseDay = filterMaxRiseDay;
    function fillFactor(stock) {
        var fns = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            fns[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var histories_1, res_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!stock.symbol) {
                            logs_1.logger.info("[stock.symbol] is ".concat(stock.symbol), logPath);
                            return [2 /*return*/, stock];
                        }
                        if (!fns.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, storage_1.Storage.getStockHistoriesFromDB(stock.symbol, 120).then(function (res) { return res.data; })];
                    case 1:
                        histories_1 = _a.sent();
                        if (histories_1 && histories_1.length > 0) {
                            res_1 = stock;
                            fns.forEach(function (fn) {
                                res_1 = fn(stock, histories_1);
                            });
                            return [2 /*return*/, res_1];
                        }
                        logs_1.logger.info("Storage.getStockHistories is empty", logPath);
                        _a.label = 2;
                    case 2: return [2 /*return*/, stock];
                }
            });
        });
    }
    function getMaxTurnoverRiseDay(histories) {
        if (!histories || histories.length <= 0) {
            return null;
        }
        var max = 0, i = 1;
        while (i < histories.length) {
            var cur = Number(histories[i - 1].turnover);
            var pre = Number(histories[i].turnover);
            if (!isNaN(cur) && !isNaN(pre) && cur > pre) {
                max++;
                i++;
            }
            else {
                break;
            }
        }
        return max;
    }
    /**
     * 寻找预启动的小票
     *
     * 小市值,连涨 3 天,换手率环比增大,连涨 3 天,位于五日线上方,离 5 日线 10 个点内
     * @param params
     */
    function filterPreRise(minCapitalStocks) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, filterRes, sheets;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!minCapitalStocks) return [3 /*break*/, 2];
                        return [4 /*yield*/, getMinCapitalStocks()];
                    case 1:
                        minCapitalStocks = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!minCapitalStocks) {
                            logs_1.logger.info("Empty minCapital socks", logPath);
                            return [2 /*return*/];
                        }
                        promises = [];
                        minCapitalStocks.forEach(function (v) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                promises.push(fillFactor(v, function (stock, histories) {
                                    var maxRiseDay = (0, rise_1.calculateMaxRiseDay)(histories);
                                    if (maxRiseDay) {
                                        stock.maxRiseDay = maxRiseDay;
                                    }
                                    return stock;
                                }, function (stock, histories) {
                                    var maxTurnoverRiseDay = getMaxTurnoverRiseDay(histories);
                                    if (maxTurnoverRiseDay) {
                                        stock["maxTurnoverRiseDay"] = maxTurnoverRiseDay;
                                    }
                                    return stock;
                                }));
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 3:
                        _a.sent();
                        filterRes = minCapitalStocks.filter(function (v) {
                            var close = Number(v.close);
                            return (close &&
                                v.sma5 &&
                                close >= v.sma5 &&
                                (close - v.sma5) / v.sma5 < 0.1 &&
                                v.maxRiseDay &&
                                v.maxRiseDay >= 3 &&
                                v["maxTurnoverRiseDay"] &&
                                v["maxTurnoverRiseDay"] >= 3);
                        });
                        sheets = [
                            {
                                name: "data",
                                data: (0, common_1.stocksToSheetData)(minCapitalStocks),
                                options: {},
                            },
                            { name: "preRise", data: (0, common_1.stocksToSheetData)(filterRes), options: {} },
                        ];
                        return [2 /*return*/, sheets];
                }
            });
        });
    }
    Strategies.filterPreRise = filterPreRise;
    function filterStocks(cb, date) {
        return __awaiter(this, void 0, void 0, function () {
            var minCapitalStocks, dates, upperLimitStocks, smaStocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getMinCapitalStocks(500, date)];
                    case 1:
                        minCapitalStocks = _a.sent();
                        if (!minCapitalStocks) {
                            logs_1.logger.info("minCapitalStocks is empty", logPath);
                            return [2 /*return*/];
                        }
                        dates = (0, date_1.getLatestTradeDates)(5);
                        return [4 /*yield*/, storage_1.Storage.queryUpperLimitStockSymbolByDates(dates).then(function (res) { return res.data; })];
                    case 2:
                        upperLimitStocks = _a.sent();
                        return [4 /*yield*/, (0, sma_1.fillStocksSMA)(minCapitalStocks.filter(function (v) {
                                return (!v.name || (v.name && !v.name.toUpperCase().includes("ST"))) &&
                                    v.symbol &&
                                    upperLimitStocks.includes(v.symbol);
                            }))];
                    case 3:
                        smaStocks = _a.sent();
                        return [2 /*return*/, smaStocks.filter(function (v) {
                                if (!v.open || !v.close)
                                    return false;
                                if (!(0, util_1.isDownCross)(v) || !(0, util_1.fitTurnover)(v, 3, 60))
                                    return false;
                                return ((v.sma5 &&
                                    ((v.open > v.sma5 && v.close < v.sma5) ||
                                        (v.close > v.sma5 && v.open < v.sma5))) ||
                                    (v.sma10 &&
                                        ((v.open > v.sma10 && v.close < v.sma10) ||
                                            (v.close > v.sma10 && v.open < v.sma10))) ||
                                    (v.sma20 &&
                                        ((v.open > v.sma20 && v.close < v.sma20) ||
                                            (v.close > v.sma20 && v.open < v.sma20))));
                            })];
                }
            });
        });
    }
    Strategies.filterStocks = filterStocks;
    /**
     * 获取涨停
     * @param stocks
     * @returns
     */
    function getUpperLimitStocks(stocks) {
        return stocks.filter(function (v) { return v.close === v.topPrice; });
    }
    Strategies.getUpperLimitStocks = getUpperLimitStocks;
})(Strategies || (exports.Strategies = Strategies = {}));
