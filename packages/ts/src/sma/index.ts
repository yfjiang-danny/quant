import { ALPH_API } from "../alph/api";
import { ALPHStockModel } from "../alph/type";
import { StockModel } from "../common/type";
import { StockWithSMA } from "./type";

/**
 * 计算移动平均数
 * @param stocks 股票数据，最新日期在前面
 * @param interval 间隔, 5——5日线 ...
 * @returns
 */
export function calculateMovingAverage(
  stocks: ALPHStockModel[],
  interval: number
): StockWithSMA[] {
  const result: StockWithSMA[] = [];

  // 检查输入有效性
  if (interval <= 0 || stocks.length === 0) {
    return result;
  }

  for (let i = 0; i < stocks.length; i++) {
    const currentDateStock = stocks[i];

    // 如果当前索引加上间隔数超过数组长度，则无法计算移动平均数
    if (i + interval > stocks.length) {
      result.push({
        ...currentDateStock,
        close: currentDateStock.close,
        [`sma${interval}`]: null,
      });
      continue;
    }

    let sum = 0;
    let validCount = 0;

    for (let j = 0; j < interval; j++) {
      const closeValue = stocks[i + j].close;

      if (typeof closeValue === "number") {
        sum += closeValue;
        validCount++;
      }
    }

    const smaValue = validCount > 0 ? sum / validCount : null;

    result.push({
      ...currentDateStock,
      close: currentDateStock.close,
      [`sma${interval}`]: smaValue,
    });
  }

  return result;
}

export async function fillStockSMA(stock: StockModel) {
  if (!stock.symbol || !stock.exchange) {
    return stock;
  }

  const symbol = stock.symbol + "." + stock.exchange;

  const histories = await ALPH_API.getStockDaily(symbol);

  if (!histories) {
    return stock;
  }

  if (!stock.sma5) {
    stock.sma5 = calculateMovingAverage(histories, 5).find(
      (v) => v.date === stock.date
    )?.sma5;
  }
  if (!stock.sma10) {
    stock.sma10 = calculateMovingAverage(histories, 10).find(
      (v) => v.date === stock.date
    )?.sma10;
  }
  if (!stock.sma20) {
    stock.sma20 = calculateMovingAverage(histories, 20).find(
      (v) => v.date === stock.date
    )?.sma20;
  }
  if (!stock.sma30) {
    stock.sma30 = calculateMovingAverage(histories, 30).find(
      (v) => v.date === stock.date
    )?.sma30;
  }
  if (!stock.sma60) {
    stock.sma60 = calculateMovingAverage(histories, 60).find(
      (v) => v.date === stock.date
    )?.sma60;
  }
  if (!stock.sma120) {
    stock.sma120 = calculateMovingAverage(histories, 120).find(
      (v) => v.date === stock.date
    )?.sma120;
  }

  return stock;
}
