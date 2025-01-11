"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPath = exports.logRootPath = exports.imgRootPath = exports.upperLimitRootPath = exports.filterRootPath = exports.allStockRootPath = exports.historyRootPath = exports.dbRootPath = exports.rootPath = void 0;
var dotenv = require("dotenv");
var path_1 = require("path");
var fs_1 = require("../utils/fs");
dotenv.config();
exports.rootPath = process.env.ROOT || path_1.default.resolve(".", ".");
exports.dbRootPath = process.env.DB_ROOT || path_1.default.resolve(exports.rootPath, "db");
exports.historyRootPath = path_1.default.resolve(exports.dbRootPath, "history");
exports.allStockRootPath = path_1.default.resolve(exports.dbRootPath, "all");
exports.filterRootPath = path_1.default.resolve(exports.dbRootPath, "filter");
exports.upperLimitRootPath = path_1.default.resolve(exports.dbRootPath, "upper_limit");
exports.imgRootPath = path_1.default.resolve(exports.rootPath, "imgs");
exports.logRootPath = process.env.LOG_ROOT || path_1.default.resolve(exports.rootPath, "logs");
function initPath() {
    (0, fs_1.createDir)(exports.rootPath).then(function () {
        (0, fs_1.createDir)(exports.dbRootPath).then(function () {
            (0, fs_1.createDir)(exports.historyRootPath);
            (0, fs_1.createDir)(exports.allStockRootPath);
            (0, fs_1.createDir)(exports.upperLimitRootPath);
        });
        (0, fs_1.createDir)(exports.logRootPath);
    });
}
exports.initPath = initPath;
