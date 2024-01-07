import { StockModel } from "../common/type";

const openClosePercentage = 0.01;
const highLowPercentage = 0.02;

/**
 * 十字星线
 * @param stock
 * @returns
 */
export function isCross(stock: StockModel): boolean {
  let res = false;

  if (stock.close && stock.open && stock.high && stock.low) {
    if (
      Math.abs(stock.close - stock.open) / stock.open <= openClosePercentage &&
      stock.high > stock.open &&
      stock.low < stock.open &&
      (stock.high - stock.open) / stock.open > highLowPercentage &&
      (stock.open - stock.low) / stock.open > highLowPercentage
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

  if (
    stock.turnover &&
    stock.turnover >= minTurnover &&
    (!maxTurnover || (maxTurnover && stock.turnover <= maxTurnover))
  ) {
    res = true;
  }

  return res;
}
