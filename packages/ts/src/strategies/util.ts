import { StockModel } from "../models/type";

const openClosePercentage = 0.02; // <1%
const highLowPercentage = 0.02; // >2%
const downCrossPercentage = 0.01;

/**
 * 下影线
 */
export function isDownCross(stock: StockModel): boolean {
  let res = false;

  const close = Number(stock.close);
  const open = Number(stock.open);
  const high = Number(stock.high);
  const low = Number(stock.low);
  if (!isNaN(close) && !isNaN(open) && !isNaN(high) && !isNaN(low)) {
    const minBox = Math.min(close, open);
    const maxBox = Math.max(close, open);
    const currentDownPercentage = (minBox - low) / minBox;
    const currentUpPercentage = (high - maxBox) / maxBox;
    if (
      low < minBox &&
      currentDownPercentage > downCrossPercentage &&
      currentUpPercentage < currentDownPercentage
    ) {
      res = true;
    }
  }

  return res;
}

/**
 * 十字星线
 * @param stock
 * @returns
 */
export function isCross(stock: StockModel): boolean {
  let res = false;

  const close = Number(stock.close);
  const open = Number(stock.open);
  const high = Number(stock.high);
  const low = Number(stock.low);
  if (!isNaN(close) && !isNaN(open) && !isNaN(high) && !isNaN(low)) {
    if (
      Math.abs(close - open) / open <= openClosePercentage &&
      high > open &&
      low < open &&
      (high - open) / open > highLowPercentage &&
      (open - low) / open > highLowPercentage
    ) {
      res = true;
    }
  }

  return res;
}

/**
 * 有影线且 下影线大于上影线
 * @param stock
 */
export function isDownCrossMoreThanUpCross(stock: StockModel): boolean {
  let res = false;

  const close = Number(stock.close);
  const open = Number(stock.open);
  const high = Number(stock.high);
  const low = Number(stock.low);
  const up = Math.max(open, close);
  const down = Math.min(open, close);
  if (!isNaN(up) && !isNaN(down) && !isNaN(high) && !isNaN(low)) {
    if (high > up && low < down && high - up <= down - low) {
      res = true;
    }
  }

  return res;
}

/**
 * 突破 20 日线
 * @param stock
 * @param minTurnover
 * @param maxTurnover
 * @returns
 */
export function isBreakthrough20(stock: StockModel): boolean {
  let res = false;
  const close = Number(stock.close);
  const open = Number(stock.open);
  const high = Number(stock.high);
  const low = Number(stock.low);
  const up = Math.max(open, close);
  const down = Math.min(open, close);
  const ma20 = stock.sma20;

  if (!ma20 || !(!isNaN(up) && !isNaN(down) && !isNaN(high) && !isNaN(low)))
    return false;

  if (high < ma20) return false;

  if (low < ma20 && close > ma20) {
    return true;
  }

  const change = Number(stock.change);
  if (!isNaN(change) && low + change < ma20 && low > ma20) return true;

  return res;
}

export function fitTurnover(
  stock: StockModel,
  minTurnover: number,
  maxTurnover?: number
): boolean {
  let res = false;

  const turnover = Number(stock.turnover);

  if (
    !isNaN(turnover) &&
    turnover >= minTurnover &&
    (!maxTurnover || (maxTurnover && turnover <= maxTurnover))
  ) {
    res = true;
  }

  return res;
}
