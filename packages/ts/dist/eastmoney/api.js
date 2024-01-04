"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EastMoney_API = void 0;
var axios_1 = require("axios");
var EastMoney_API;
(function (EastMoney_API) {
    function getQuoteSnapshot(symbol, market) {
        var callbackKey = "jQueryH";
        var timestamp = new Date().getTime();
        return axios_1.default
            .get("https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot?id=".concat(symbol, "&market=").concat(market, "&DC_APP_KEY=dcquotes-service-tweb&DC_TIMESTAMP=").concat(timestamp, "&DC_SIGN=81160C38A19B3006FD96BC54300AD889&callback=").concat(callbackKey, "&_=").concat(timestamp + 1))
            .then(function (res) {
            if (res.status == 200) {
                try {
                    var jsonStr = res.data.slice(callbackKey.length + 1, res.data.length - 2);
                    var data = JSON.parse(jsonStr);
                    return data;
                }
                catch (error) {
                    return null;
                }
            }
            return null;
        })
            .catch(function (e) {
            return null;
        });
    }
    EastMoney_API.getQuoteSnapshot = getQuoteSnapshot;
})(EastMoney_API || (exports.EastMoney_API = EastMoney_API = {}));
