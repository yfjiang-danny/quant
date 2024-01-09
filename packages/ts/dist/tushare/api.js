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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUSHARE_API = void 0;
var axios_1 = __importDefault(require("axios"));
var logs_1 = require("../logs");
var constant_1 = require("./constant");
var mock_1 = require("./mock");
// http://api.tushare.pro
var StockFields = Object.keys(constant_1.TushareStockColumns);
var TUSHARE_API;
(function (TUSHARE_API) {
    function request(path, params) {
        return axios_1.default.post(process.env.TUSHARE_API, __assign(__assign({}, params), { api_name: path, token: process.env.TUSHARE_TOKEN }));
    }
    function getAllStock(params) {
        if (params === void 0) { params = { exchange: "", list_status: "L" }; }
        return request("stock_basic", {
            fields: StockFields.join(","),
            params: params,
        })
            .then(function (res) {
            logs_1.logger.info(res.data);
            if (res.status == 200) {
                var responseData = res === null || res === void 0 ? void 0 : res.data;
                if ((responseData === null || responseData === void 0 ? void 0 : responseData.code) != 0) {
                    logs_1.logger.info("Use mock data");
                    responseData = mock_1.mockAllStockResponse;
                }
                var data_1 = responseData === null || responseData === void 0 ? void 0 : responseData.data;
                if (data_1) {
                    var stocks_1 = [];
                    data_1.items.forEach(function (item) {
                        var stock = {};
                        item.forEach(function (v, i) {
                            var key = data_1.fields[i];
                            if (key) {
                                stock[key] = v;
                            }
                        });
                        stocks_1.push(stock);
                    });
                    return stocks_1;
                }
            }
            return null;
        })
            .catch(function (e) {
            console.log(e);
            return null;
        });
    }
    TUSHARE_API.getAllStock = getAllStock;
})(TUSHARE_API || (exports.TUSHARE_API = TUSHARE_API = {}));
