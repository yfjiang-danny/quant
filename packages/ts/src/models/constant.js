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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockColumns = void 0;
var constant_1 = require("../third/eastmoney/constant");
var constant_2 = require("../third/tushare/constant");
var constant_3 = require("./rise/constant");
var constant_4 = require("./sma/constant");
var constant_5 = require("./upperlimit/constant");
exports.StockColumns = __assign(__assign(__assign(__assign(__assign(__assign({}, constant_2.TushareStockColumns), constant_1.EastMoneyColumns), constant_4.SMAColumns), constant_3.MaxRiseColumns), {
    maxTurnoverRiseDay: "换手率连续增长天数",
}), constant_5.LadderColumns);
