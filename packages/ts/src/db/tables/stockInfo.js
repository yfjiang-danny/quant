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
exports.StockInfoTable = void 0;
var base_1 = require("./base");
var sql_1 = require("sql");
exports.StockInfoTable = sql_1.default.define({
    name: "stock_info",
    schema: "",
    columns: __assign(__assign({}, base_1.baseColumns), { name: {
            name: "name",
            dataType: base_1.nameDataType,
        }, fullname: {
            name: "fullname",
            dataType: "varchar(250)",
        }, enname: {
            name: "enname",
            dataType: "varchar(250)",
        }, cnspell: {
            name: "cnspell",
            dataType: "varchar(250)",
        }, symbol: {
            name: "symbol",
            dataType: base_1.symbolDataType,
            notNull: true,
            unique: true,
        }, market: {
            name: "market",
            dataType: "varchar(20)",
        }, exchange: {
            name: "exchange",
            dataType: "varchar(10)",
        }, list_date: {
            name: "list_date",
            dataType: base_1.dateDataType,
        }, delist_date: {
            name: "delist_date",
            dataType: base_1.dateDataType,
        }, industry: {
            name: "industry",
            dataType: "varchar(100)",
        }, area: {
            name: "area",
            dataType: "varchar(100)",
        }, curr_type: {
            name: "curr_type",
            dataType: "varchar(20)",
        }, list_status: {
            name: "list_status",
            dataType: "varchar(4)",
        }, is_hs: {
            name: "is_hs",
            dataType: "varchar(4)",
        }, act_name: {
            name: "act_name",
            dataType: "varchar(100)",
        }, act_ent_type: {
            name: "act_ent_type",
            dataType: "varchar(100)",
        }, is_del: {
            name: "is_del",
            dataType: "smallint",
        } }),
});
