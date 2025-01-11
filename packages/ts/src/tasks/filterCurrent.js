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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCurrent = void 0;
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
var moment_1 = require("moment");
var path_1 = require("path");
var common_1 = require("../common");
var paths_1 = require("../common/paths");
var logs_1 = require("../logs");
var sma_1 = require("../service/factors/sma");
var storage_1 = require("../service/storage/storage");
var utils_1 = require("../service/utils");
var strategies_1 = require("../strategies");
var excel_1 = require("../utils/excel");
var utils_2 = require("./utils");
var logPath = path_1.default.resolve(paths_1.logRootPath, "filter_current.log");
function filterCurrent(cb, mailer, skipEast) {
    return __awaiter(this, void 0, void 0, function () {
        var latestStock, minCapitalStocks, newStocks, _a, smaStocks, crossStocks, filePath, sheets;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if ((0, chinese_calendar_ts_1.isHoliday)(new Date())) {
                        logs_1.logger.info("".concat(new Date().toDateString(), " is holiday, return"));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, storage_1.Storage.getStockHistoriesFromDB("000001", 1).then(function (res) {
                            var _a;
                            return (_a = res.data) === null || _a === void 0 ? void 0 : _a[0];
                        })];
                case 1:
                    latestStock = _c.sent();
                    return [4 /*yield*/, strategies_1.Strategies.getMinCapitalStocks(100, latestStock === null || latestStock === void 0 ? void 0 : latestStock.date)];
                case 2:
                    minCapitalStocks = (_b = (_c.sent())) === null || _b === void 0 ? void 0 : _b.filter(function (v) { return !v.name || (v.name && !v.name.toUpperCase().includes("ST")); });
                    if (!minCapitalStocks || minCapitalStocks.length <= 0) {
                        logs_1.logger.info("Storage.getAllStocks is empty", logPath);
                        return [2 /*return*/];
                    }
                    if (!skipEast) return [3 /*break*/, 3];
                    _a = minCapitalStocks;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, utils_1.fillEastStockInfo)(minCapitalStocks)];
                case 4:
                    _a = _c.sent();
                    _c.label = 5;
                case 5:
                    newStocks = _a;
                    return [4 /*yield*/, (0, sma_1.fillStocksSMA)(newStocks)];
                case 6:
                    smaStocks = _c.sent();
                    return [4 /*yield*/, strategies_1.Strategies.filterCross(smaStocks)];
                case 7:
                    crossStocks = _c.sent();
                    if (!crossStocks) {
                        cb === null || cb === void 0 ? void 0 : cb("filterCurrent sheets is empty");
                        logs_1.logger.info("filterCurrent sheets is empty", logPath);
                        return [2 /*return*/];
                    }
                    filePath = path_1.default.resolve(paths_1.filterRootPath, "filter_current_".concat((0, moment_1.default)().format("YYYYMMDD"), ".xlsx"));
                    sheets = [];
                    sheets.push({
                        name: "cross",
                        data: (0, common_1.stocksToSheetData)(crossStocks),
                        options: {},
                    });
                    Promise.allSettled([
                        (0, utils_2.drawCodeToImg)(crossStocks),
                        excel_1.Excel.write(sheets, filePath),
                    ])
                        .then(function (_a) {
                        var imgsRes = _a[0];
                        var imgsMailContent = {};
                        if (imgsRes.status === "fulfilled" && imgsRes.value) {
                            imgsMailContent.html = "";
                            imgsMailContent.attachments = [];
                            imgsRes.value.forEach(function (v) {
                                var _a;
                                var _b = path_1.default.basename(v).split("."), name = _b[0], ext = _b[1];
                                imgsMailContent.html += "<img src=\"cid:".concat(name, "\"/>");
                                (_a = imgsMailContent.attachments) === null || _a === void 0 ? void 0 : _a.push({
                                    filename: "".concat(name, ".").concat(ext),
                                    path: v,
                                    cid: name, //same cid value as in the html img src
                                });
                            });
                        }
                        try {
                            var mailOptions = {
                                to: process.env.MAIL_USER_NAME,
                                subject: (0, moment_1.default)().format("YYYY-MM-DD"),
                                html: imgsMailContent.html,
                                attachments: __spreadArray([
                                    {
                                        filename: "filter-".concat((0, moment_1.default)().format("YYYYMMDD"), ".xlsx"),
                                        path: filePath,
                                    }
                                ], (imgsMailContent.attachments || []), true),
                            };
                            mailer === null || mailer === void 0 ? void 0 : mailer.send(mailOptions).then(function (res) {
                                logs_1.logger.info(res, logPath);
                            }).catch(function (e) {
                                logs_1.logger.info(e, logPath);
                            });
                        }
                        catch (error) {
                            logs_1.logger.info(error, logPath);
                        }
                    })
                        .catch(function (e) {
                        logs_1.logger.info(e, logPath);
                        cb === null || cb === void 0 ? void 0 : cb();
                    })
                        .finally(function () {
                        cb === null || cb === void 0 ? void 0 : cb();
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.filterCurrent = filterCurrent;
