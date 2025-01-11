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
exports.fillingLadder = void 0;
var dotenv = require("dotenv");
var moment_1 = require("moment");
var path_1 = require("path");
var paths_1 = require("../common/paths");
var ladder_1 = require("../db/interface/ladder");
var logs_1 = require("../logs");
var storage_1 = require("../service/storage/storage");
dotenv.config();
var logPath = path_1.default.resolve(paths_1.logRootPath, "derivative.log");
function calcLadder(symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var histories, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getStockHistoriesFromDB(symbol).then(function (res) { return res.data; })];
                case 1:
                    histories = _a.sent();
                    i = 0;
                    while (i < histories.length - 1) {
                        if (histories[i].close !== histories[i].top_price) {
                            return [2 /*return*/, i];
                        }
                        i++;
                    }
                    return [2 /*return*/, i];
            }
        });
    });
}
function fillingLadder(date) {
    return __awaiter(this, void 0, void 0, function () {
        var limitedStocks, upperLimit, _i, limitedStocks_1, v, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    date = date !== null && date !== void 0 ? date : (0, moment_1.default)().format("YYYYMMDD");
                    return [4 /*yield*/, storage_1.Storage.getStockSnapshotByDate(date).then(function (res) {
                            return res.data.filter(function (v) { return v.close == v.top_price; });
                        })];
                case 1:
                    limitedStocks = _d.sent();
                    if (!limitedStocks || limitedStocks.length <= 0) {
                        logs_1.logger.info("FillingLadder failed: stocks is empty", logPath);
                        return [2 /*return*/];
                    }
                    upperLimit = [];
                    _i = 0, limitedStocks_1 = limitedStocks;
                    _d.label = 2;
                case 2:
                    if (!(_i < limitedStocks_1.length)) return [3 /*break*/, 5];
                    v = limitedStocks_1[_i];
                    _b = (_a = upperLimit).push;
                    _c = {
                        date: v.date,
                        name: v.name,
                        symbol: v.symbol
                    };
                    return [4 /*yield*/, calcLadder(v.symbol)];
                case 3:
                    _b.apply(_a, [(_c.ladder = _d.sent(),
                            _c)]);
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (!(upperLimit && upperLimit.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, ladder_1.IStockLadderTable.insert(upperLimit)];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    logs_1.logger.info("FillingLadder success", logPath);
                    return [2 /*return*/];
            }
        });
    });
}
exports.fillingLadder = fillingLadder;
