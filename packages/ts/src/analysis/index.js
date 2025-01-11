"use strict";
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
exports.Analysis = void 0;
var promises_1 = require("fs/promises");
var moment_1 = require("moment");
var path_1 = require("path");
var paths_1 = require("../common/paths");
var logs_1 = require("../logs");
var sma_1 = require("../service/factors/sma");
var storage_1 = require("../service/storage/storage");
var fs_1 = require("../utils/fs");
var Analysis;
(function (Analysis) {
    function log(msg) {
        logs_1.logger.info(msg, path_1.default.resolve(paths_1.logRootPath, "analysis.log"));
    }
    function getFilePaths() {
        return new Promise(function (resolve) {
            var dir = path_1.default.resolve(paths_1.dbRootPath, "yahoo");
            (0, promises_1.readdir)(dir)
                .then(function (fileNames) {
                resolve(fileNames.map(function (fileName) { return path_1.default.resolve(dir, fileName); }));
            }, function (e) {
                log(e);
                resolve([]);
            })
                .catch(function (e) {
                log(e);
                resolve([]);
            });
        });
    }
    function fillSMAInBatch(filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var data, stockArr, smaStocksArr, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fs_1.readJsonFileInBatch)(filePaths, filePaths.length)];
                    case 1:
                        data = _a.sent();
                        if (!data) return [3 /*break*/, 4];
                        stockArr = data
                            .map(function (histories, i) {
                            if (histories) {
                                return histories
                                    .map(function (v) {
                                    if (!v)
                                        return null;
                                    var stock = {};
                                    var open = Number(v.Open);
                                    if (!isNaN(open)) {
                                        stock.open = open;
                                    }
                                    var close = Number(v.Close);
                                    if (!isNaN(close)) {
                                        stock.close = close;
                                    }
                                    var high = Number(v.High);
                                    if (!isNaN(high)) {
                                        stock.high = high;
                                    }
                                    var low = Number(v.Low);
                                    if (!isNaN(low)) {
                                        stock.low = low;
                                    }
                                    var volume = Number(v.Volume);
                                    if (!isNaN(volume)) {
                                        stock.volume = volume;
                                    }
                                    if (v.Date) {
                                        stock.date = (0, moment_1.default)(v.Date).format("YYYYMMDD");
                                    }
                                    var match = filePaths[i].match(/([\d]+)\.json/);
                                    if (match && match[1]) {
                                        stock.symbol = match[1];
                                    }
                                    return stock;
                                })
                                    .filter(function (v) { return !!v; });
                            }
                            return null;
                        })
                            .filter(function (v) { return !!v; });
                        smaStocksArr = stockArr.map(function (v) {
                            if (v) {
                                return (0, sma_1.calculateMovingAverage)((0, sma_1.calculateMovingAverage)((0, sma_1.calculateMovingAverage)((0, sma_1.calculateMovingAverage)((0, sma_1.calculateMovingAverage)((0, sma_1.calculateMovingAverage)(v, 5), 10), 20), 30), 60), 120);
                            }
                            else {
                                return null;
                            }
                        });
                        if (!smaStocksArr) {
                            log("smaStocksArr is empty");
                            return [2 /*return*/];
                        }
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < smaStocksArr.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, storage_1.Storage.saveStocks(smaStocksArr[i])];
                    case 3:
                        _a.sent();
                        i++;
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function getHistory() {
        return __awaiter(this, void 0, void 0, function () {
            var filePaths, size, len, batch, i, start, end;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getFilePaths()];
                    case 1:
                        filePaths = _a.sent();
                        if (filePaths.length <= 0) {
                            log("Empty filePaths");
                            return [2 /*return*/];
                        }
                        size = 5;
                        len = filePaths.slice(5).length;
                        batch = Math.round(len / size);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < batch)) return [3 /*break*/, 4];
                        start = i * size, end = Math.min((i + 1) * size, len);
                        return [4 /*yield*/, fillSMAInBatch(filePaths.slice(start, end))];
                    case 3:
                        _a.sent();
                        i++;
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    Analysis.getHistory = getHistory;
})(Analysis || (exports.Analysis = Analysis = {}));
