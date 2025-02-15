"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stocksToSheetData = exports.excelToStocks = void 0;
var constant_1 = require("../models/constant");
function excelToStocks(sheetData) {
    var allStockData = sheetData.slice(2);
    var keys = sheetData[0];
    var allStocks = [];
    allStockData.forEach(function (v) {
        var stock = {};
        keys.forEach(function (key, i) {
            if (v[i]) {
                stock[key] = v[i];
            }
        });
        allStocks.push(stock);
    });
    return allStocks;
}
exports.excelToStocks = excelToStocks;
function stocksToSheetData(stocks) {
    var rows = [];
    var columnKeys = Object.keys(constant_1.StockColumns);
    rows.push(columnKeys);
    var header = [];
    columnKeys.forEach(function (key) {
        header.push(constant_1.StockColumns[key]);
    });
    rows.push(header);
    stocks.forEach(function (v) {
        var row = [];
        columnKeys.forEach(function (key, i) {
            row.push(v[key] || undefined);
        });
        rows.push(row);
    });
    return rows;
}
exports.stocksToSheetData = stocksToSheetData;
