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
exports.IStockTimeSnapshotTable = void 0;
var moment_1 = require("moment");
var snapshot_1 = require("../tables/snapshot");
var connect_1 = require("../connect");
var IStockTimeSnapshotTable;
(function (IStockTimeSnapshotTable) {
    function getTable(t) {
        switch (t) {
            case 15:
                return snapshot_1.StockSnapshot15Table;
            case 18:
                return snapshot_1.StockSnapshot18Table;
            case 25:
                return snapshot_1.StockSnapshot25Table;
            case 30:
                return snapshot_1.StockSnapshot30Table;
            default:
                return snapshot_1.StockSnapshot15Table;
        }
    }
    IStockTimeSnapshotTable.getTable = getTable;
    function insert(tableType, stocks, shouldUpdate) {
        if (shouldUpdate === void 0) { shouldUpdate = false; }
        var size = 500, len = stocks.length;
        var querys = [];
        var start = 0, end = size;
        var table = getTable(tableType);
        while (start < len && end > start) {
            querys.push(table.insert(stocks.slice(start, end).map(function (v) { return (__assign(__assign({}, v), { createAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss"), updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") })); }))
                .onConflict({
                columns: [table.symbol.name, table.date.name],
                update: shouldUpdate
                    ? table.columns
                        .filter(function (v) {
                        var _a, _b, _c;
                        return ![
                            (_a = table.symbol) === null || _a === void 0 ? void 0 : _a.name,
                            (_b = table.date) === null || _b === void 0 ? void 0 : _b.name,
                            (_c = table.createAt) === null || _c === void 0 ? void 0 : _c.name,
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
    IStockTimeSnapshotTable.insert = insert;
    function update(tableType, stocks) {
        var _a;
        //
        var querys = [];
        var i = 0;
        var table = getTable(tableType);
        while (i < stocks.length) {
            var stock = stocks[i++];
            querys.push(table
                .update(__assign(__assign({}, stock), { updateAt: (0, moment_1.default)().format("YYYY-MM-DD hh:mm:ss") }))
                .where((_a = table.symbol) === null || _a === void 0 ? void 0 : _a.equals(stock.symbol).and(table.date.equals(stock.date)))
                .toQuery());
        }
        return (0, connect_1.dbQuery)(querys);
    }
    IStockTimeSnapshotTable.update = update;
    function del(tableType, stocks) {
        var table = getTable(tableType);
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
    IStockTimeSnapshotTable.del = del;
    function getStocksByDate(tableType, date, node) {
        if (node === void 0) { node = undefined; }
        var table = getTable(tableType);
        //
        var mQuery = table.select(table.star()).where(table.date.equals(date));
        if (node) {
            mQuery = mQuery.where(node);
        }
        var query = mQuery.order(table.symbol).toQuery();
        return (0, connect_1.dbQuery)(query);
    }
    IStockTimeSnapshotTable.getStocksByDate = getStocksByDate;
    function getStocksBySymbol(tableType, symbol, limit, offset) {
        var table = getTable(tableType);
        //
        var mQuery = table
            .select(table.star())
            .where(table.symbol.equals(symbol))
            .order(table.date.descending);
        if (typeof limit === "number") {
            if (typeof offset === "number") {
                mQuery = mQuery.offset(offset);
            }
            mQuery = mQuery.limit(limit);
        }
        return (0, connect_1.dbQuery)(mQuery.toQuery());
    }
    IStockTimeSnapshotTable.getStocksBySymbol = getStocksBySymbol;
    function getStockDetailsByDate(tableType, date, offset, limit) {
        var table = getTable(tableType);
        var tableName = table.getName();
        var str = "SELECT a.*,b.*\n    FROM \"".concat(tableName, "\" a\n    left outer join stock_info b\n    on a.symbol = b.symbol\n    where a.date = '").concat(date, "'\n    and a.symbol is not null\n    and b.symbol is not null\n\n    order by a.symbol");
        if (typeof offset === "number" && limit) {
            str += " offset ".concat(offset, " limit ").concat(limit);
        }
        return (0, connect_1.dbQuery)({
            text: str,
        });
    }
    IStockTimeSnapshotTable.getStockDetailsByDate = getStockDetailsByDate;
})(IStockTimeSnapshotTable || (exports.IStockTimeSnapshotTable = IStockTimeSnapshotTable = {}));
