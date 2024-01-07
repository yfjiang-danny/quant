"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterStocksFilePath = exports.minCapitalStocksFilePath = exports.allCapitalStocksFilePath = exports.allStocksFilePath = exports.dbPath = exports.rootPath = exports.dateString = void 0;
var moment_1 = __importDefault(require("moment"));
var path_1 = __importDefault(require("path"));
exports.dateString = (0, moment_1.default)().format("YYYYMMDD");
exports.rootPath = path_1.default.resolve(".", ".");
exports.dbPath = path_1.default.resolve(exports.rootPath, "src", "db");
exports.allStocksFilePath = path_1.default.resolve(exports.dbPath, "all_stocks.xlsx");
exports.allCapitalStocksFilePath = path_1.default.resolve(exports.dbPath, "all_capital_stocks.xlsx");
exports.minCapitalStocksFilePath = path_1.default.resolve(exports.dbPath, "min_capital_stocks.xlsx");
exports.filterStocksFilePath = path_1.default.resolve(exports.dbPath, "filter_stocks.xlsx");
