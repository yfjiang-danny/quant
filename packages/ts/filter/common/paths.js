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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPath = exports.logRootPath = exports.allStockRootPath = exports.historyRootPath = exports.dbRootPath = exports.rootPath = void 0;
var dotenv = __importStar(require("dotenv"));
var path_1 = __importDefault(require("path"));
var fs_1 = require("../utils/fs");
dotenv.config();
exports.rootPath = process.env.ROOT || path_1.default.resolve(".", ".");
exports.dbRootPath = process.env.DB_ROOT || path_1.default.resolve(exports.rootPath, "db");
exports.historyRootPath = path_1.default.resolve(exports.dbRootPath, "history");
exports.allStockRootPath = path_1.default.resolve(exports.dbRootPath, "all");
exports.logRootPath = process.env.LOG_ROOT || path_1.default.resolve(exports.rootPath, "logs");
function initPath() {
    (0, fs_1.createDir)(exports.rootPath).then(function () {
        (0, fs_1.createDir)(exports.dbRootPath).then(function () {
            (0, fs_1.createDir)(exports.historyRootPath);
            (0, fs_1.createDir)(exports.allStockRootPath);
        });
        (0, fs_1.createDir)(exports.logRootPath);
    });
}
exports.initPath = initPath;
