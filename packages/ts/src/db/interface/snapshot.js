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
exports.IStockSnapshotTable = void 0;
var moment_1 = require("moment");
var snapshot_1 = require("../tables/snapshot");
var connect_1 = require("../connect");
var IStockSnapshotTable;
(function (IStockSnapshotTable) {
    function insert(stocks, shouldUpdate) {
        if (shouldUpdate === void 0) { shouldUpdate = false; }
        //
        var size = 500, len = stocks.length;
        var querys = [];
        var start = 0, end = size;
        while (start < len && end > start) {
            querys.push(snapshot_1.StockSnapshotTable.insert(stocks.slice(start, end).map(function (v) { return (__assign(__assign({}, v), { createAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss"), updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") })); }))
                .onConflict({
                columns: [
                    snapshot_1.StockSnapshotTable.symbol.name,
                    snapshot_1.StockSnapshotTable.date.name,
                ],
                update: shouldUpdate
                    ? snapshot_1.StockSnapshotTable.columns
                        .filter(function (v) {
                        var _a, _b, _c;
                        return ![
                            (_a = snapshot_1.StockSnapshotTable.symbol) === null || _a === void 0 ? void 0 : _a.name,
                            (_b = snapshot_1.StockSnapshotTable.date) === null || _b === void 0 ? void 0 : _b.name,
                            (_c = snapshot_1.StockSnapshotTable.createAt) === null || _c === void 0 ? void 0 : _c.name,
                        ].includes(v.name);
                    })
                        .map(function (v) {
                        return v.name;
                    })
                    : undefined,
            })
                .toQuery());
            start = end;
            end = start + size;
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockSnapshotTable.insert = insert;
    function update(stocks) {
        var _a;
        //
        var querys = [];
        var i = 0;
        while (i < stocks.length) {
            var stock = stocks[i++];
            querys.push(snapshot_1.StockSnapshotTable.update(__assign(__assign({}, stock), { updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") }))
                .where((_a = snapshot_1.StockSnapshotTable.symbol) === null || _a === void 0 ? void 0 : _a.equals(stock.symbol).and(snapshot_1.StockSnapshotTable.date.equals(stock.date)))
                .toQuery());
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockSnapshotTable.update = update;
    function del(stocks) {
        //
        var mQuery = snapshot_1.StockSnapshotTable.delete();
        var node = undefined;
        var i = 0;
        while (i < stocks.length) {
            var stock = stocks[i++];
            if (node) {
                node = node.or(snapshot_1.StockSnapshotTable.symbol
                    .equals(stock.symbol)
                    .and(snapshot_1.StockSnapshotTable.date.equals(stock.date)));
            }
            else {
                node = snapshot_1.StockSnapshotTable.symbol
                    .equals(stock.symbol)
                    .and(snapshot_1.StockSnapshotTable.date.equals(stock.date));
            }
        }
        if (node) {
            mQuery = mQuery.where(node);
        }
        var query = mQuery.toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockSnapshotTable.del = del;
    function getStocksByDate(date, node) {
        //
        var mQuery = snapshot_1.StockSnapshotTable.select(snapshot_1.StockSnapshotTable.star()).where(snapshot_1.StockSnapshotTable.date.equals(date));
        if (node) {
            mQuery = mQuery.where(node);
        }
        var query = mQuery.order(snapshot_1.StockSnapshotTable.symbol).toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockSnapshotTable.getStocksByDate = getStocksByDate;
    function getStocksBySymbol(symbol, limit, offset) {
        //
        var mQuery = snapshot_1.StockSnapshotTable.select(snapshot_1.StockSnapshotTable.star())
            .where(snapshot_1.StockSnapshotTable.symbol.equals(symbol))
            .order(snapshot_1.StockSnapshotTable.date.descending);
        if (typeof limit === "number") {
            if (typeof offset === "number") {
                mQuery = mQuery.offset(offset);
            }
            mQuery = mQuery.limit(limit);
        }
        return (0, connect_1.dbQuery)(mQuery.toQuery());
    }
    IStockSnapshotTable.getStocksBySymbol = getStocksBySymbol;
    function getStockDetailsByDate(date, offset, limit) {
        var str = "SELECT a.*,b.*\n    FROM \"stock_snapshots\" a\n    left outer join stock_info b\n    on a.symbol = b.symbol\n    where a.date = '".concat(date, "'\n    and a.symbol is not null\n    and b.symbol is not null\n\n    order by a.symbol");
        if (typeof offset === "number" && limit) {
            str += " offset ".concat(offset, " limit ").concat(limit);
        }
        return (0, connect_1.dbQuery)({
            text: str,
        });
    }
    IStockSnapshotTable.getStockDetailsByDate = getStockDetailsByDate;
})(IStockSnapshotTable || (exports.IStockSnapshotTable = IStockSnapshotTable = {}));
