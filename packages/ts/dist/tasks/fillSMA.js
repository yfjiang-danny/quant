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
var logs_1 = require("../logs");
var path_1 = __importDefault(require("path"));
var fs_1 = require("fs");
var excel_1 = require("../utils/excel");
var common_1 = require("./common");
var utils_1 = require("./utils");
var common_2 = require("../common");
var node_schedule_1 = require("node-schedule");
dotenv.config();
function fillSMATask() {
    var _this = this;
    (0, fs_1.access)(common_1.allCapitalStocksFilePath, fs_1.constants.F_OK, function (err) { return __awaiter(_this, void 0, void 0, function () {
        var allSheets, sheet, allStocks, sheetData, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!err) return [3 /*break*/, 1];
                    console.log("".concat(common_1.allCapitalStocksFilePath, " do not exist"));
                    return [3 /*break*/, 5];
                case 1: return [4 /*yield*/, excel_1.Excel.read(common_1.allCapitalStocksFilePath)];
                case 2:
                    allSheets = _b.sent();
                    if (!(allSheets && allSheets.length > 0)) return [3 /*break*/, 4];
                    sheet = allSheets[0];
                    allStocks = (0, common_2.excelToStocks)(sheet.data);
                    _a = common_2.stocksToSheetData;
                    return [4 /*yield*/, (0, utils_1.fillAllStockSMA)(allStocks)];
                case 3:
                    sheetData = _a.apply(void 0, [_b.sent()]);
                    allSheets[0] = __assign(__assign({}, sheet), { data: sheetData });
                    _b.label = 4;
                case 4:
                    if (allSheets) {
                        excel_1.Excel.write(allSheets.map(function (v) {
                            return __assign(__assign({}, v), { options: {} });
                        }), common_1.allCapitalStocksFilePath);
                    }
                    _b.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
}
(function main() {
    logs_1.logger.setFilePath(path_1.default.resolve(common_1.rootPath, "logs", "sma.log"));
    // 每天早上 4 点
    (0, node_schedule_1.scheduleJob)("* 30 8 * *", fillSMATask);
})();
