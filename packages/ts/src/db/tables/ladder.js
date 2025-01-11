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
exports.StockLadderTable = void 0;
var sql_1 = require("sql");
var base_1 = require("./base");
exports.StockLadderTable = sql_1.default.define({
    name: "stock_ladder",
    schema: "",
    columns: __assign(__assign({}, base_1.baseColumns), { date: {
            name: "date",
            dataType: base_1.dateDataType,
            notNull: true,
            primaryKey: true,
        }, symbol: {
            name: "symbol",
            dataType: base_1.symbolDataType,
            notNull: true,
            primaryKey: true,
        }, name: {
            name: "name",
            dataType: base_1.nameDataType,
        }, ladder: {
            name: "ladder",
            dataType: "smallint",
        } }),
});
