"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filePathMap = void 0;
var path_1 = __importDefault(require("path"));
var rootPath = path_1.default.resolve(__dirname, ".", ".");
exports.filePathMap = {
    allStock: path_1.default.resolve(rootPath, "db", "all_stocks.xlsx"),
    minStock: path_1.default.resolve(rootPath, "db", "min_stocks.xlsx"),
};
