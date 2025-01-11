"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitTurnover = exports.isCross = exports.isDownCross = void 0;
var openClosePercentage = 0.02; // <1%
var highLowPercentage = 0.02; // >2%
var downCrossPercentage = 0.01;
/**
 * 下影线
 */
function isDownCross(stock) {
    var res = false;
    var close = Number(stock.close);
    var open = Number(stock.open);
    var high = Number(stock.high);
    var low = Number(stock.low);
    if (!isNaN(close) && !isNaN(open) && !isNaN(high) && !isNaN(low)) {
        var minBox = Math.min(close, open);
        var maxBox = Math.max(close, open);
        var currentDownPercentage = (minBox - low) / minBox;
        var currentUpPercentage = (high - maxBox) / maxBox;
        if (low < minBox &&
            currentDownPercentage > downCrossPercentage &&
            currentUpPercentage < currentDownPercentage) {
            res = true;
        }
    }
    return res;
}
exports.isDownCross = isDownCross;
/**
 * 十字星线
 * @param stock
 * @returns
 */
function isCross(stock) {
    var res = false;
    var close = Number(stock.close);
    var open = Number(stock.open);
    var high = Number(stock.high);
    var low = Number(stock.low);
    if (!isNaN(close) && !isNaN(open) && !isNaN(high) && !isNaN(low)) {
        if (Math.abs(close - open) / open <= openClosePercentage &&
            high > open &&
            low < open &&
            (high - open) / open > highLowPercentage &&
            (open - low) / open > highLowPercentage) {
            res = true;
        }
    }
    return res;
}
exports.isCross = isCross;
function fitTurnover(stock, minTurnover, maxTurnover) {
    var res = false;
    var turnover = Number(stock.turnover);
    if (!isNaN(turnover) &&
        turnover >= minTurnover &&
        (!maxTurnover || (maxTurnover && turnover <= maxTurnover))) {
        res = true;
    }
    return res;
}
exports.fitTurnover = fitTurnover;
