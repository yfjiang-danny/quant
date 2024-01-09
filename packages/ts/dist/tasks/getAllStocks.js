"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
var node_schedule_1 = require("node-schedule");
var path_1 = __importDefault(require("path"));
var constant_1 = require("../common/constant");
var logs_1 = require("../logs");
var storage_1 = require("../storage/storage");
var api_1 = require("../tushare/api");
var excel_1 = require("../utils/excel");
var sleep_1 = require("../utils/sleep");
var common_1 = require("./common");
dotenv.config();
function saveToJson(stocks) {
    return storage_1.Storage.saveAllBasicStocks(stocks).then(function (res) {
        return res.data;
    });
}
function saveAllStock(stocks) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (stocks && stocks.length > 0) {
                return [2 /*return*/, excel_1.Excel.insertToExcel({
                        columns: constant_1.StockColumns,
                        data: stocks,
                        filePath: common_1.allStocksFilePath,
                        sheetName: common_1.dateString,
                    })];
            }
            return [2 /*return*/, false];
        });
    });
}
function getAllStocks() {
    return new Promise(function (resolve) {
        api_1.TUSHARE_API.getAllStock().then(function (res) {
            if (res) {
                saveToJson(res).then(function (res) { return resolve(res); });
                saveAllStock(res);
            }
            else {
                resolve(false);
            }
        });
    });
}
function task(repeat) {
    return __awaiter(this, void 0, void 0, function () {
        var max, success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    max = repeat;
                    success = false;
                    _a.label = 1;
                case 1:
                    if (!(!success && max > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getAllStocks()];
                case 2:
                    success = _a.sent();
                    max--;
                    if (!!success) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, sleep_1.sleep)(1000 * 60 * 60 * 60 + 1000 * 60 * 5)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
(function main() {
    logs_1.logger.setFilePath(path_1.default.resolve(common_1.rootPath, "logs", "all_stocks.log"));
    task(5);
    // 星期1~5 早上 4 点
    // scheduleJob("* * 9 * 1-5", task.bind(null, 5));
    // 每天早上 4 点
    // scheduleJob("* * 4 * *", task.bind(null, 5));
    process.on("SIGINT", function () {
        (0, node_schedule_1.gracefulShutdown)().then(function () { return process.exit(0); });
    });
})();
