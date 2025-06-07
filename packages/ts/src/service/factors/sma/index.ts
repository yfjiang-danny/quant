import path from "path";
import { logRootPath } from "../../../common/paths";
import { logger } from "../../../logs";
import { StockWithSMA } from "../../../models/sma/type";
import { StockModel } from "../../../models/type";
import { Storage } from "../../storage/storage";
import pLimit from "p-limit";
import { StockSnapshotTable } from "../../../db/tables/snapshot";

const logPath = path.resolve(logRootPath, "sma.log");

interface CoreModel extends Record<string, unknown> {
  symbol?: string;
  date: string;
  close: number;
}

export function calculateIntervalAverage<T extends CoreModel>(
  histories: T[],
  interval: number
) {
  if (histories.length < interval) {
    return null;
  }
  return calculateAverage(histories.slice(0, interval));
}

export function calculateAverage<T extends CoreModel>(histories: T[]) {
  let i = 0,
    count = 0,
    sum = 0;
  while (i < histories.length) {
    const stock = histories[i];
    const close = Number(stock.close);
    if (!isNaN(close)) {
      sum += close;
      count++;
    }
    i++;
  }
  return Number((sum / count).toFixed(2));
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
      const closeValue = Number(histories[i + j].close);

      if (!isNaN(closeValue)) {
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

export async function fillStockSMA<T extends CoreModel>(stock: T) {
  if (!stock.symbol) {
    return stock;
  }

  const symbol = stock.symbol;

  let histories = await Storage.getStockHistoriesFromDB(symbol, 130, 0, [
    StockSnapshotTable.date.lte(stock.date),
    StockSnapshotTable.open.isNotNull(),
  ]).then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
    return res.data as unknown as CoreModel[];
  });

  if (!histories) {
    return stock;
  }

  let findIndex = histories.findIndex((v) => v.date === stock.date);

  if (findIndex === -1) {
    if (
      histories[0].date &&
      stock.date &&
      Number(stock.date) > Number(histories[0].date)
    ) {
      histories.unshift(stock);
      findIndex = 0;
    } else {
      return stock;
    }
  }

  histories = histories.slice(findIndex);

  if (histories.length < 5) {
    return stock;
  }

  if (!stock.sma5) {
    (stock as any).sma5 = calculateIntervalAverage(histories, 5) ?? undefined;
  }

  if (histories.length < 10) {
    return stock;
  }

  if (!stock.sma10) {
    (stock as any).sma10 = calculateIntervalAverage(histories, 10) ?? undefined;
  }

  if (histories.length < 20) {
    return stock;
  }
  if (!stock.sma20) {
    (stock as any).sma20 = calculateIntervalAverage(histories, 20) ?? undefined;
  }

  if (histories.length < 30) {
    return stock;
  }
  if (!stock.sma30) {
    (stock as any).sma30 = calculateIntervalAverage(histories, 30) ?? undefined;
  }

  if (histories.length < 60) {
    return stock;
  }
  if (!stock.sma60) {
    (stock as any).sma60 = calculateIntervalAverage(histories, 60) ?? undefined;
  }

  if (histories.length < 120) {
    return stock;
  }
  if (!stock.sma120) {
    (stock as any).sma120 =
      calculateIntervalAverage(histories, 120) ?? undefined;
  }

  return stock;
}

export function fillOneStockSMA(oneStockHistories: StockModel[]) {
  const newStocks: StockModel[] = [];
  oneStockHistories.forEach((v, i) => {
    const smaStock = { ...v };
    [5, 10, 20, 30, 60, 120].forEach((interval) => {
      smaStock[`sma${interval}`] = calculateIntervalAverage(
        oneStockHistories.slice(i, interval + 1) as unknown as CoreModel[],
        interval
      );
    });
    newStocks.push(smaStock);
  });
  return newStocks;
}

/**
 *
 * @param stocks
 * @returns
 */
export function fillStocksSMA(stocks: StockModel[]) {
  // logger.info("fillAllStockSMA start...", logPath);

  const limit = pLimit(20);

  const promises = stocks.map((v) => limit(() => fillStockSMA(v as CoreModel)));

  // const promises: Promise<StockWithSMA>[] = [];
  // stocks.forEach((v) => {
  //   promises.push(fillStockSMA(v as CoreModel));
  // });

  return Promise.allSettled(promises).then((responses) => {
    const res: StockModel[] = [];
    responses.forEach((v, i) => {
      if (v.status === "fulfilled" && v.value) {
        res.push({ ...stocks[i], ...v.value } as StockModel);
      } else {
        res.push({ ...stocks[i] } as StockModel);
      }
    });
    // logger.info("fillAllStockSMA finished...", logPath);
    return res;
  });
}
