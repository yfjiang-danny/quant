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
exports.StockSnapshot30Table = exports.StockSnapshot25Table = exports.StockSnapshot18Table = exports.StockSnapshot15Table = exports.StockSnapshotTable = void 0;
var sql_1 = require("sql");
var base_1 = require("./base");
var StockSnapshotTableColumn = __assign(__assign({}, base_1.baseColumns), { date: {
        dataType: base_1.dateDataType,
        notNull: true,
        primaryKey: true,
    }, time: {
        dataType: base_1.dateDataType,
    }, symbol: {
        dataType: base_1.symbolDataType,
        notNull: true,
        primaryKey: true,
    }, name: {
        dataType: base_1.nameDataType,
    }, open: {
        dataType: base_1.numberFixedDataType,
    }, close: {
        dataType: base_1.numberFixedDataType,
    }, avg: {
        dataType: base_1.numberFixedDataType,
    }, high: {
        dataType: base_1.numberFixedDataType,
    }, low: {
        dataType: base_1.numberFixedDataType,
    }, top_price: {
        dataType: base_1.numberFixedDataType,
    }, bottom_price: {
        dataType: base_1.numberFixedDataType,
    }, change: {
        dataType: base_1.numberFixedDataType,
    }, turnover: {
        dataType: base_1.numberFixedDataType,
    }, volume: {
        dataType: base_1.numberFixedDataType,
    }, internal: {
        dataType: base_1.numberFixedDataType,
    }, external: {
        dataType: base_1.numberFixedDataType,
    }, buy1: {
        dataType: base_1.numberFixedDataType,
    }, buy2: {
        dataType: base_1.numberFixedDataType,
    }, sale1: {
        dataType: base_1.numberFixedDataType,
    }, sale2: {
        dataType: base_1.numberFixedDataType,
    }, buy1_count: {
        dataType: base_1.IntegerDataType,
    }, buy2_count: {
        dataType: base_1.IntegerDataType,
    }, sale1_count: {
        dataType: base_1.IntegerDataType,
    }, sale2_count: {
        dataType: base_1.IntegerDataType,
    } });
exports.StockSnapshotTable = sql_1.default.define({
    name: "stock_snapshots",
    schema: "",
    columns: StockSnapshotTableColumn,
});
var StockTimeSnapshotTableColumn = __assign(__assign({}, StockSnapshotTableColumn), { time: {
        dataType: base_1.dateDataType,
    } });
exports.StockSnapshot15Table = sql_1.default.define({
    name: "stock_snapshots_15",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
});
exports.StockSnapshot18Table = sql_1.default.define({
    name: "stock_snapshots_18",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
});
exports.StockSnapshot25Table = sql_1.default.define({
    name: "stock_snapshots_25",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
});
exports.StockSnapshot30Table = sql_1.default.define({
    name: "stock_snapshots_30",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
});
