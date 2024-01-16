"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitTurnover = exports.isCross = void 0;
var openClosePercentage = 0.01; // <1%
var highLowPercentage = 0.02; // >2%
/**
 * 十字星线
 * @param stock
 * @returns
 */
function isCross(stock) {
    var res = false;
    if (stock.close && stock.open && stock.high && stock.low) {
        if (Math.abs(stock.close - stock.open) / stock.open <= openClosePercentage &&
            stock.high > stock.open &&
            stock.low < stock.open &&
            (stock.high - stock.open) / stock.open > highLowPercentage &&
            (stock.open - stock.low) / stock.open > highLowPercentage) {
            res = true;
        }
    }
    return res;
}
exports.isCross = isCross;
function fitTurnover(stock, minTurnover, maxTurnover) {
    var res = false;
    if (stock.turnover &&
        stock.turnover >= minTurnover &&
        (!maxTurnover || (maxTurnover && stock.turnover <= maxTurnover))) {
        res = true;
    }
    return res;
}
exports.fitTurnover = fitTurnover;
