"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var api_1 = require("./api");
dotenv.config();
function main() {
    api_1.ALPH_API.getCompanyOverview("002932.SHZ")
        .then(function (res) {
        console.log("res", JSON.stringify(res.data));
    })
        .catch(function (err) {
        console.log("err", err);
    });
}
main();
