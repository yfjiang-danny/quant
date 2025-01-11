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
exports.StockService = void 0;
var convert_1 = require("../../utils/convert");
var api_1 = require("../../third/eastmoney/api");
var storage_1 = require("../storage/storage");
var StockService = /** @class */ (function () {
    function StockService() {
    }
    //   logger: Logger;
    //   constructor() {
    //     this.logger = new Logger(path.resolve(logRootPath, "stock_service.log"));
    //   }
    /**
     *
     * @param date 20240115
     * @returns
     */
    StockService.prototype.getAllStocks = function (date) {
        return storage_1.Storage.getAllStocks(date);
    };
    /**
     *
     * @param symbol 000001
     * @returns
     */
    StockService.prototype.getStockHistories = function (symbol) {
        return storage_1.Storage.getStockHistories(symbol);
    };
    /**
     * 获取过往日线
     * @param symbol 000001
     * @param date 20240115
     * @returns
     */
    StockService.prototype.getStockDaily = function (symbol, date) {
        return storage_1.Storage.getStock(symbol, date);
    };
    StockService.prototype.getStockCurrent = function (symbol) {
        var market = (0, convert_1.getMarket)(symbol);
        return Promise.allSettled([
            storage_1.Storage.getStock(symbol),
            api_1.EastMoney_API.getStockInfo(symbol, market),
        ]).then(function (_a) {
            var stock = _a[0], stockInfo = _a[1];
            var res = {
                data: null,
            };
            if (stock.status == "fulfilled") {
                res.data = __assign({}, stock.value);
            }
            else {
                res.msg = stock.reason;
            }
            if (stockInfo.status == "fulfilled") {
                res.data = __assign(__assign({}, res.data), stockInfo.value);
            }
            else {
                res.msg = stockInfo.reason;
            }
            return res;
        });
    };
    StockService.prototype.getStockTradeInfo = function (symbol) {
        return api_1.EastMoney_API.getQuoteSnapshot(symbol, (0, convert_1.getMarket)(symbol));
    };
    return StockService;
}());
exports.StockService = StockService;
