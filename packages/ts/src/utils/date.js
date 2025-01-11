"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestTradeDates = exports.isTradeDate = exports.findExistDate = void 0;
var chinese_calendar_ts_1 = require("chinese-calendar-ts");
var fs_1 = require("fs");
var moment_1 = require("moment");
var path_1 = require("path");
/**
 * 找最近存在数据的日期
 * @param rootPath
 * @param d
 * @returns
 */
function findExistDate(rootPath, d, ext) {
    var mDate = (0, moment_1.default)(d);
    var dateStr = mDate.format("YYYYMMDD");
    var success = false;
    var max = 30;
    while (!success && max > 0) {
        try {
            var filePath = path_1.default.resolve(rootPath, dateStr);
            if (ext) {
                filePath += ext;
            }
            (0, fs_1.accessSync)(filePath);
            success = true;
            break;
        }
        catch (error) {
            mDate.subtract(1, "days");
            dateStr = mDate.format("YYYYMMDD");
        }
        max--;
    }
    return success ? dateStr : undefined;
}
exports.findExistDate = findExistDate;
function isTradeDate(d) {
    var day = d.getDay();
    return !(0, chinese_calendar_ts_1.isHoliday)(d) && day > 0 && day < 6;
}
exports.isTradeDate = isTradeDate;
function getLatestTradeDates(num, from, format) {
    if (num === void 0) { num = 1; }
    if (from === void 0) { from = new Date(); }
    if (format === void 0) { format = "YYYYMMDD"; }
    var res = [];
    var m = (0, moment_1.default)(from);
    var i = 0;
    while (i < num) {
        if (isTradeDate(m.toDate())) {
            res.push(m.format(format));
            i++;
        }
        m.add(-1, "d");
    }
    return res;
}
exports.getLatestTradeDates = getLatestTradeDates;
