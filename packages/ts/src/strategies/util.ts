import { StockModel } from "../models/type";

const openClosePercentage = 0.01; // <1%
const highLowPercentage = 0.02; // >2%

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

export function fitTurnover(
  stock: StockModel,
  minTurnover: number,
  maxTurnover?: number
): boolean {
  let res = false;

  const turnover = Number(stock.turnover)

  if (
    !isNaN(turnover) &&
    turnover >= minTurnover &&
    (!maxTurnover || (maxTurnover && turnover <= maxTurnover))
  ) {
    res = true;
  }

  return res;
}
