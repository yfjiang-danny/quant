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
exports.collectionTask = void 0;
var dotenv = require("dotenv");
var logs_1 = require("../logs");
var sma_1 = require("../service/factors/sma");
var storage_1 = require("../service/storage/storage");
var api_1 = require("../third/tushare/api");
var utils_1 = require("../service/utils");
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
dotenv.config();
var alphTaskStocks;
function fillHistoryByALPH() {
    return __awaiter(this, void 0, void 0, function () {
        var arr, promises_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logs_1.logger.info("FillHistoryByALPH start...");
                    if (!(!alphTaskStocks || alphTaskStocks.length <= 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, storage_1.Storage.getAllStocks().then(function (res) { return res.data; })];
                case 1:
                    alphTaskStocks = (_a.sent()).filter(function (v) {
                        !!v.ts_code;
                    });
                    _a.label = 2;
                case 2:
                    if (alphTaskStocks.length > 0) {
                        arr = alphTaskStocks.splice(0, 25);
                        promises_1 = [];
                        arr.forEach(function (v) {
                            promises_1.push((0, utils_1.fillStockHistoryByALPH)(v));
                        });
                        Promise.allSettled(promises_1)
                            .catch(function (e) {
                            console.log(e);
                        })
                            .finally(function () {
                            logs_1.logger.info("FillHistoryByALPH end...");
                        });
                    }
                    else {
                        logs_1.logger.info("FillHistoryByALPH end...");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function collectionTask(mailer) {
    return __awaiter(this, void 0, void 0, function () {
        var allBasicStocks, fillResult, smaResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                        logs_1.logger.info("".concat(new Date().toDateString(), " is holiday, return"));
                        return [2 /*return*/];
                    }
                    logs_1.logger.info("Start collection task");
                    return [4 /*yield*/, api_1.TUSHARE_API.getAllStock()];
                case 1:
                    allBasicStocks = _a.sent();
                    if (!(!allBasicStocks || allBasicStocks.length <= 0)) return [3 /*break*/, 3];
                    console.log("TUSHARE_API is null, call Storage.getAllBasicStocks");
                    return [4 /*yield*/, storage_1.Storage.getAllBasicStocks().then(function (res) {
                            if (res.msg) {
                                console.log(res.msg);
                            }
                            return res.data;
                        })];
                case 2:
                    allBasicStocks = _a.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, storage_1.Storage.saveAllBasicStocks(allBasicStocks)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, storage_1.Storage.insertStockInfos(allBasicStocks)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!allBasicStocks || allBasicStocks.length <= 0) {
                        console.log("allBasicStocks is empty, collection task stop.");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(allBasicStocks)];
                case 7:
                    fillResult = _a.sent();
                    if (!fillResult || fillResult.length <= 0) {
                        console.log("fillTradeInfo is empty. collection task stop.");
                        return [2 /*return*/];
                    }
                    storage_1.Storage.insertStockHistories(fillResult);
                    return [4 /*yield*/, (0, sma_1.fillStocksSMA)(fillResult)];
                case 8:
                    smaResult = _a.sent();
                    if (!smaResult || smaResult.length <= 0) {
                        console.log("fillStocksSMA is empty");
                    }
                    return [4 /*yield*/, storage_1.Storage.saveStocks(smaResult || fillResult, true).then(function (res) {
                            if (res.msg) {
                                console.log(res.msg);
                            }
                        })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, fillHistoryByALPH()];
                case 10:
                    _a.sent();
                    console.log("Collection Task complete");
                    mailer === null || mailer === void 0 ? void 0 : mailer.send({
                        to: process.env.MAIL_USER_NAME,
                        subject: "collection",
                        text: "Collection Task complete",
                    }).then(function (res) {
                        logs_1.logger.info(res);
                    }).catch(function (e) {
                        logs_1.logger.info(e);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.collectionTask = collectionTask;
