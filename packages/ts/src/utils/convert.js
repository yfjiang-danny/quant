"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarket = void 0;
function getMarket(symbol) {
    switch (symbol.slice(0, 1)) {
        case "0":
        case "3":
            return "SZ";
        case "6":
            return "SH";
        default:
            return "OC";
    }
}
exports.getMarket = getMarket;
