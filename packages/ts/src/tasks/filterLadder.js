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
exports.filterLadder = void 0;
var path_1 = require("path");
var paths_1 = require("../common/paths");
var logs_1 = require("../logs");
var storage_1 = require("../service/storage/storage");
var utils_1 = require("../service/utils");
var ladder_1 = require("../db/interface/ladder");
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
var logPath = path_1.default.resolve(paths_1.logRootPath, "filter_ladder.log");
function calcLadder(stock) {
    return __awaiter(this, void 0, void 0, function () {
        var histories, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockHistories(stock.symbol).then(function (res) { return res.data; })];
                case 1:
                    histories = _a.sent();
                    i = 0;
                    while (i < histories.length - 1) {
                        histories[i].topPrice = Number((0, utils_1.calcTopPriceLimit)(histories[i + 1]));
                        if (histories[i].close !== histories[i].topPrice) {
                            return [2 /*return*/, i];
                        }
                        i;
                    }
                    return [2 /*return*/, i + 1];
            }
        });
    });
}
function filterLadder() {
    return __awaiter(this, void 0, void 0, function () {
        var allStocks, newStocks, upperLimit, _i, upperLimit_1, v, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                        logs_1.logger.info("".concat(new Date().toDateString(), " is holiday, return"));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.getStockInfosFromDB().then(function (res) { return res.data; })];
                case 1:
                    allStocks = _b.sent();
                    if (!allStocks || allStocks.length <= 0) {
                        logs_1.logger.info("stocks is empty", logPath);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allStocks)];
                case 2:
                    newStocks = (_b.sent()).filter(function (v) { return !v.name || (v.name && !v.name.toUpperCase().includes("ST")); });
                    logs_1.logger.info(newStocks, path_1.default.resolve(paths_1.logRootPath, "20240324.json"));
                    upperLimit = newStocks.filter(function (v) { return v.close && v.close === v.topPrice; });
                    logs_1.logger.info(upperLimit, path_1.default.resolve(paths_1.logRootPath, "limit.json"));
                    _i = 0, upperLimit_1 = upperLimit;
                    _b.label = 3;
                case 3:
                    if (!(_i < upperLimit_1.length)) return [3 /*break*/, 6];
                    v = upperLimit_1[_i];
                    _a = v;
                    return [4 /*yield*/, calcLadder(v)];
                case 4:
                    _a.ladder = _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    logs_1.logger.info(upperLimit, path_1.default.resolve(paths_1.logRootPath, "ladder.json"));
                    if (!(upperLimit && upperLimit.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, ladder_1.IStockLadderTable.insert(upperLimit.map(function (v) {
                            return {
                                date: v.date,
                                ladder: v.ladder,
                                name: v.name,
                                symbol: v.symbol,
                            };
                        }))];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.filterLadder = filterLadder;
