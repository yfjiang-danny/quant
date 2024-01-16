"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkday = exports.findExistDate = void 0;
var fs_1 = require("fs");
var moment_1 = __importDefault(require("moment"));
var path_1 = __importDefault(require("path"));
/**
 * 找最近存在数据的日期
 * @param rootPath
 * @param d
 * @returns
 */
function findExistDate(rootPath, d) {
    var date = (0, moment_1.default)(d);
    var dateStr = date.format("YYYYMMDD");
    var success = false;
    var max = 10;
    while (!success && max > 0) {
        try {
            (0, fs_1.accessSync)(path_1.default.resolve(rootPath, dateStr));
            success = true;
            break;
        }
        catch (error) {
            date.subtract(1, "days");
            dateStr = date.format("YYYYMMDD");
        }
        max--;
    }
    return success ? dateStr : undefined;
}
exports.findExistDate = findExistDate;
function isWorkday(date) {
    return (0, moment_1.default)(date).isoWeekday() < 6;
}
exports.isWorkday = isWorkday;
