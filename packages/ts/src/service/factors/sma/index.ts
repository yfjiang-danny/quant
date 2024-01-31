import path from "path";
import { logRootPath } from "../../../common/paths";
import { logger } from "../../../logs";
import { StockWithSMA } from "../../../models/sma/type";
import { StockModel } from "../../../models/type";
import { Storage } from "../../storage/storage";

const logPath = path.resolve(logRootPath, "sma.log");

function calculateIntervalAverage(histories: StockModel[], interval: number) {
  if (histories.length < interval) {
    return null;
  }
  return calculateAverage(histories.slice(0, interval));
}

function calculateAverage(histories: StockModel[]) {
  let i = 0,
    count = 0,
    sum = 0;
  while (i < histories.length) {
    const stock = histories[i];
    if (stock && stock.close) {
      sum += stock.close;
      count++;
    }
    i++;
  }
  return sum / count;
}

/**
 * 计算移动平均数
 * @param histories 股票数据，最新日期在前面
 * @param interval 间隔, 5——5日线 ...
 * @returns
 */
export function calculateMovingAverage(
  histories: StockModel[],
  interval: number
): StockWithSMA[] {
  const result: StockWithSMA[] = [];

  // 检查输入有效性
  if (interval <= 0 || histories.length === 0) {
    return histories;
  }

  for (let i = 0; i < histories.length; i++) {
    const currentDateStock = histories[i];

    // 如果当前索引加上间隔数超过数组长度，则无法计算移动平均数
    if (i + interval > histories.length) {
      result.push({
        ...currentDateStock,
        [`sma${interval}`]: null,
      });
      continue;
    }

    let sum = 0;
    let validCount = 0;

    for (let j = 0; j < interval; j++) {
      const closeValue = histories[i + j].close;

      if (typeof closeValue === "number") {
        sum += closeValue;
        validCount++;
      }
    }

    const smaValue = validCount > 0 ? sum / validCount : null;

    result.push({
      ...currentDateStock,
      [`sma${interval}`]: smaValue,
    });
  }

  return result;
}

export async function fillStockSMA(stock: StockModel) {
  if (!stock.symbol) {
    return stock;
  }

  const symbol = stock.symbol;

  let histories = await Storage.getStockHistories(symbol).then((res) =>
    res.data
      .filter((v) => v && v.date)
      .sort((a, b) => {
        return Number(b.date) - Number(a.date);
      })
  );

  if (!histories) {
    return stock;
  }

  const findIndex = histories.findIndex((v) => v.date === stock.date);

  if (findIndex === -1) {
    return stock;
  }

  histories = histories.slice(findIndex);

  if (histories.length < 5) {
    return stock;
  }

  if (!stock.sma5) {
    stock.sma5 = calculateIntervalAverage(histories, 5) ?? undefined;
  }

  if (histories.length < 10) {
    return stock;
  }

  if (!stock.sma10) {
    stock.sma10 = calculateIntervalAverage(histories, 10) ?? undefined;
  }

  if (histories.length < 20) {
    return stock;
  }
  if (!stock.sma20) {
    stock.sma20 = calculateIntervalAverage(histories, 20) ?? undefined;
  }

  if (histories.length < 30) {
    return stock;
  }
  if (!stock.sma30) {
    stock.sma30 = calculateIntervalAverage(histories, 30) ?? undefined;
  }

  if (histories.length < 60) {
    return stock;
  }
  if (!stock.sma60) {
    stock.sma60 = calculateIntervalAverage(histories, 60) ?? undefined;
  }

  if (histories.length < 120) {
    return stock;
  }
  if (!stock.sma120) {
    stock.sma120 = calculateIntervalAverage(histories, 120) ?? undefined;
  }

  return stock;
}

/**
 *
 * @param stocks
 * @returns
 */
export function fillStocksSMA(stocks: StockModel[]) {
  logger.info("fillAllStockSMA start...");

  const promises: Promise<StockWithSMA>[] = [];
  stocks.forEach((v) => {
    promises.push(fillStockSMA(v));
  });

  return Promise.allSettled(promises).then((responses) => {
    const res: StockModel[] = [];
    responses.forEach((v, i) => {
      if (v.status === "fulfilled" && v.value) {
        res.push({ ...stocks[i], ...v.value } as StockModel);
      } else {
        res.push({ ...stocks[i] } as StockModel);
      }
    });
    logger.info("fillAllStockSMA finished...");
    return res;
  });
}
