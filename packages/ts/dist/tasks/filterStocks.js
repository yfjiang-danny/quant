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
var moment_1 = __importDefault(require("moment"));
var node_schedule_1 = require("node-schedule");
var path_1 = __importDefault(require("path"));
var common_1 = require("../common");
var logs_1 = require("../logs");
var storage_1 = require("../storage/storage");
var strategy_1 = require("../strategy");
var excel_1 = require("../utils/excel");
var common_2 = require("./common");
var utils_1 = require("./utils");
dotenv.config();
function filter() {
    return __awaiter(this, void 0, void 0, function () {
        var allStocks, minCapitalStocks, crossStocks, sheets, limitedStocks, fillSMAStocks, filterStocks, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.Storage.getAllStocks().then(function (res) {
                        if (res.msg) {
                            console.log(res.msg);
                        }
                        return res.data;
                    })];
                case 1:
                    allStocks = _a.sent();
                    if (allStocks.length <= 0) {
                        console.log("Stocks is empty");
                        return [2 /*return*/];
                    }
                    minCapitalStocks = allStocks
                        .filter(function (v) {
                        var symbol = v.symbol;
                        var isFitSymbol = !symbol ||
                            symbol.startsWith("3") ||
                            symbol.startsWith("60") ||
                            symbol.startsWith("0");
                        var capital = v.capital;
                        return isFitSymbol && capital && capital < 100;
                    })
                        .sort(function (a, b) { return a.capital - b.capital; });
                    crossStocks = minCapitalStocks.filter(function (v) {
                        return (0, strategy_1.isCross)(v) && (0, strategy_1.fitTurnover)(v, 3, 60);
                    });
                    if (crossStocks.length <= 0) {
                        console.log("crossStocks is empty");
                        return [2 /*return*/];
                    }
                    sheets = [
                        { name: "cross", data: (0, common_1.stocksToSheetData)(crossStocks), options: {} },
                    ];
                    limitedStocks = crossStocks.slice(0, 25);
                    return [4 /*yield*/, (0, utils_1.fillAllStockSMA)(limitedStocks)];
                case 2:
                    fillSMAStocks = _a.sent();
                    sheets.push({
                        name: "sma",
                        data: (0, common_1.stocksToSheetData)(fillSMAStocks),
                        options: {},
                    });
                    filterStocks = fillSMAStocks.filter(function (v) { return v.sma5 && v.sma10 && v.sma20 && v.sma5 > v.sma10 && v.sma10 > v.sma20; });
                    if (filterStocks.length <= 0) {
                        console.log("filterStocks is empty");
                    }
                    sheets.push({
                        name: "filter",
                        data: (0, common_1.stocksToSheetData)(filterStocks),
                        options: {},
                    });
                    filePath = path_1.default.resolve(common_2.dbPath, "filter_".concat((0, moment_1.default)().format("YYYYMMDDHHMMSS"), ".xlsx"));
                    excel_1.Excel.write(sheets, filePath).then(function () { return console.log(filePath); });
                    return [2 /*return*/];
            }
        });
    });
}
(function main() {
    logs_1.logger.setFilePath(path_1.default.resolve(common_2.rootPath, "logs", "filter_stocks.log"));
    // 星期1~5 早上 9 点
    //   scheduleJob("* * 9 * 1-5", filter);
    filter();
    process.on("SIGINT", function () {
        (0, node_schedule_1.gracefulShutdown)().then(function () { return process.exit(0); });
    });
})();
