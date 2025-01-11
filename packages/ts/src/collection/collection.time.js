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
exports.time30Collection = exports.time25Collection = exports.time18Collection = exports.time15Collection = void 0;
var storage_1 = require("../service/storage/storage");
var dotenv = require("dotenv");
var queue_1 = require("../utils/queue");
var utils_1 = require("../service/utils");
var logs_1 = require("../logs");
var path_1 = require("path");
var paths_1 = require("../common/paths");
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
dotenv.config();
var queue = new queue_1.Queue();
function log(msg) {
    logs_1.logger.info(msg, path_1.default.resolve(paths_1.logRootPath, "collection.time.db.log"));
}
function snapshot15() {
    return __awaiter(this, void 0, void 0, function () {
        var allBasicStocks, dailyStocks, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockInfosFromDB()];
                case 1:
                    allBasicStocks = _a.sent();
                    if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
                        log("Update 9:15 info failed: empty basic stocks, ".concat(allBasicStocks.msg));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allBasicStocks.data)];
                case 2:
                    dailyStocks = _a.sent();
                    if (!dailyStocks || dailyStocks.length == 0) {
                        log("Update 9:15 info failed: empty daily stocks");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.insertStockTimeHistories(15, dailyStocks)];
                case 3:
                    res = _a.sent();
                    if (res.data) {
                        log("Update 9:15 info success");
                    }
                    else {
                        log("Update 9:15 info failed: ".concat(res.msg));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function snapshot18() {
    return __awaiter(this, void 0, void 0, function () {
        var allBasicStocks, dailyStocks, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockInfosFromDB()];
                case 1:
                    allBasicStocks = _a.sent();
                    if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
                        log("Update 9:18 info failed: empty basic stocks, ".concat(allBasicStocks.msg));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allBasicStocks.data)];
                case 2:
                    dailyStocks = _a.sent();
                    if (!dailyStocks || dailyStocks.length == 0) {
                        log("Update 9:18 info failed: empty daily stocks");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.insertStockTimeHistories(18, dailyStocks)];
                case 3:
                    res = _a.sent();
                    if (res.data) {
                        log("Update 9:18 info success");
                    }
                    else {
                        log("Update 9:18 info failed: ".concat(res.msg));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function snapshot25() {
    return __awaiter(this, void 0, void 0, function () {
        var allBasicStocks, dailyStocks, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockInfosFromDB()];
                case 1:
                    allBasicStocks = _a.sent();
                    if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
                        log("Update 9:25 info failed: empty basic stocks, ".concat(allBasicStocks.msg));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allBasicStocks.data)];
                case 2:
                    dailyStocks = _a.sent();
                    if (!dailyStocks || dailyStocks.length == 0) {
                        log("Update 9:25 info failed: empty daily stocks");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.insertStockTimeHistories(25, dailyStocks)];
                case 3:
                    res = _a.sent();
                    if (res.data) {
                        log("Update 9:25 info success");
                    }
                    else {
                        log("Update 9:25 info failed: ".concat(res.msg));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function snapshot30() {
    return __awaiter(this, void 0, void 0, function () {
        var allBasicStocks, dailyStocks, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockInfosFromDB()];
                case 1:
                    allBasicStocks = _a.sent();
                    if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
                        log("Update 9:30 info failed: empty basic stocks, ".concat(allBasicStocks.msg));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allBasicStocks.data)];
                case 2:
                    dailyStocks = _a.sent();
                    if (!dailyStocks || dailyStocks.length == 0) {
                        log("Update 9:30 info failed: empty daily stocks");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.insertStockTimeHistories(30, dailyStocks)];
                case 3:
                    res = _a.sent();
                    if (res.data) {
                        log("Update 9:30 info success");
                    }
                    else {
                        log("Update 9:30 info failed: ".concat(res.msg));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function time15Collection(mailer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                log("".concat(new Date().toDateString(), " is holiday, return"));
                return [2 /*return*/];
            }
            snapshot15();
            return [2 /*return*/];
        });
    });
}
exports.time15Collection = time15Collection;
function time18Collection(mailer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                log("".concat(new Date().toDateString(), " is holiday, return"));
                return [2 /*return*/];
            }
            snapshot18();
            return [2 /*return*/];
        });
    });
}
exports.time18Collection = time18Collection;
function time25Collection(mailer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                log("".concat(new Date().toDateString(), " is holiday, return"));
                return [2 /*return*/];
            }
            snapshot25();
            return [2 /*return*/];
        });
    });
}
exports.time25Collection = time25Collection;
function time30Collection(mailer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                log("".concat(new Date().toDateString(), " is holiday, return"));
                return [2 /*return*/];
            }
            snapshot30();
            return [2 /*return*/];
        });
    });
}
exports.time30Collection = time30Collection;
