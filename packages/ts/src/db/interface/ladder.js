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
exports.IStockLadderTable = void 0;
var moment_1 = require("moment");
var ladder_1 = require("../tables/ladder");
var connect_1 = require("../connect");
var IStockLadderTable;
(function (IStockLadderTable) {
    function insert(stocks) {
        //
        var size = 500, len = stocks.length;
        var querys = [];
        var start = 0, end = size;
        while (start < len && end > start) {
            querys.push(ladder_1.StockLadderTable.insert(stocks.slice(start, end).map(function (v) { return (__assign(__assign({}, v), { createAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss"), updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") })); }))
                .onConflict({
                columns: [ladder_1.StockLadderTable.symbol.name, ladder_1.StockLadderTable.date.name],
                update: ladder_1.StockLadderTable.columns
                    .filter(function (v) {
                    var _a, _b, _c;
                    return ![
                        (_a = ladder_1.StockLadderTable.symbol) === null || _a === void 0 ? void 0 : _a.name,
                        (_b = ladder_1.StockLadderTable.date) === null || _b === void 0 ? void 0 : _b.name,
                        (_c = ladder_1.StockLadderTable.createAt) === null || _c === void 0 ? void 0 : _c.name,
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
    IStockLadderTable.insert = insert;
    function update(stocks) {
        var _a;
        //
        var querys = [];
        var i = 0;
        while (i < stocks.length) {
            var stock = stocks[i++];
            querys.push(ladder_1.StockLadderTable.update(__assign(__assign({}, stock), { updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") }))
                .where((_a = ladder_1.StockLadderTable.symbol) === null || _a === void 0 ? void 0 : _a.equals(stock.symbol))
                .toQuery());
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockLadderTable.update = update;
    function del(stocks) {
        //
        var mQuery = ladder_1.StockLadderTable.delete();
        var node = undefined;
        var i = 0;
        while (i < stocks.length) {
            var stock = stocks[i++];
            if (node) {
                node = node.or(ladder_1.StockLadderTable.symbol
                    .equals(stock.symbol)
                    .and(ladder_1.StockLadderTable.date.equals(stock.date)));
            }
            else {
                node = ladder_1.StockLadderTable.symbol
                    .equals(stock.symbol)
                    .and(ladder_1.StockLadderTable.date.equals(stock.date));
            }
        }
        if (node) {
            mQuery = mQuery.where(node);
        }
        var query = mQuery.toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockLadderTable.del = del;
    function getStockLadderByDate(date, ladder) {
        //
        var mQuery = ladder_1.StockLadderTable.select(ladder_1.StockLadderTable.star()).where(ladder_1.StockLadderTable.date.equals(date));
        if (ladder) {
            mQuery = mQuery.where(ladder_1.StockLadderTable.ladder.equals(ladder));
        }
        return (0, connect_1.dbQuery)(mQuery.order(ladder_1.StockLadderTable.ladder).toQuery());
    }
    IStockLadderTable.getStockLadderByDate = getStockLadderByDate;
    function getStockLadderSymbolByDates(dates) {
        //
        var mQuery = ladder_1.StockLadderTable.select(ladder_1.StockLadderTable.symbol)
            .where(ladder_1.StockLadderTable.date.in(dates).and(ladder_1.StockLadderTable.symbol.isNotNull()))
            .group(ladder_1.StockLadderTable.symbol);
        var query = mQuery.order(ladder_1.StockLadderTable.symbol).toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockLadderTable.getStockLadderSymbolByDates = getStockLadderSymbolByDates;
})(IStockLadderTable || (exports.IStockLadderTable = IStockLadderTable = {}));
