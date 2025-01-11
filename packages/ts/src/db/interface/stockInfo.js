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
exports.IStockInfoTable = void 0;
var moment_1 = require("moment");
var stockInfo_1 = require("../tables/stockInfo");
var connect_1 = require("../connect");
var IStockInfoTable;
(function (IStockInfoTable) {
    function insert(stocks) {
        var _a;
        //
        var size = 500, len = stocks.length;
        var querys = [];
        var start = 0, end = size;
        while (start < len && end > start) {
            querys.push(stockInfo_1.StockInfoTable.insert(stocks.slice(start, end).map(function (v) { return (__assign(__assign({}, v), { createAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss"), updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") })); }))
                .onConflict({
                columns: [(_a = stockInfo_1.StockInfoTable.symbol) === null || _a === void 0 ? void 0 : _a.name],
                update: stockInfo_1.StockInfoTable.columns
                    .filter(function (v) {
                    var _a, _b;
                    return ![
                        (_a = stockInfo_1.StockInfoTable.symbol) === null || _a === void 0 ? void 0 : _a.name,
                        (_b = stockInfo_1.StockInfoTable.createAt) === null || _b === void 0 ? void 0 : _b.name,
                    ].includes(v.name);
                })
                    .map(function (v) {
                    return v.name;
                }),
            })
                .toQuery());
            start = end;
            end = start + size;
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockInfoTable.insert = insert;
    function update(stocks) {
        var _a;
        //
        var querys = [];
        var i = 0;
        while (i < stocks.length) {
            var stock = stocks[i++];
            querys.push(stockInfo_1.StockInfoTable.update(__assign(__assign({}, stock), { updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") }))
                .where((_a = stockInfo_1.StockInfoTable.symbol) === null || _a === void 0 ? void 0 : _a.equals(stock.symbol))
                .toQuery());
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockInfoTable.update = update;
    function del(symbols) {
        var _a;
        //
        var query = stockInfo_1.StockInfoTable.delete()
            .where((_a = stockInfo_1.StockInfoTable.symbol) === null || _a === void 0 ? void 0 : _a.in(symbols))
            .toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockInfoTable.del = del;
    function getAllStocks() {
        var _a;
        //
        var query = stockInfo_1.StockInfoTable.select(stockInfo_1.StockInfoTable.star())
            .where((_a = stockInfo_1.StockInfoTable.is_del) === null || _a === void 0 ? void 0 : _a.isNull())
            .toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockInfoTable.getAllStocks = getAllStocks;
    function getStockInfoBySymbol(symbol) {
        var _a;
        var query = stockInfo_1.StockInfoTable.select(stockInfo_1.StockInfoTable.star())
            .from(stockInfo_1.StockInfoTable)
            .where((_a = stockInfo_1.StockInfoTable.symbol) === null || _a === void 0 ? void 0 : _a.equals(symbol))
            .toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockInfoTable.getStockInfoBySymbol = getStockInfoBySymbol;
})(IStockInfoTable || (exports.IStockInfoTable = IStockInfoTable = {}));
