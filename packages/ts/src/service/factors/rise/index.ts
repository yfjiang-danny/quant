import { StockModel } from "../../../models/type";
import { Storage } from "../../storage/storage";

/**
 * 连涨天数
 * @param symbol
 * @param day
 */
export function calculateMaxRiseDay(histories: StockModel[]) {
  histories = histories
    .filter((v) => {
      if (!v.date) {
        console.log(`Empty date: `, JSON.stringify(v));

        return false;
      }
      return true;
    })
    .sort((a, b) => Number(a.date) - Number(b.date));

  if (histories.length <= 1) {
    return null;
  }

  let max = 0,
    i = 1;
  while (i < histories.length) {
    const cur = histories[i - 1].close;
    const pre = histories[i].close;
    if (cur && pre && cur > pre) {
      max++;
      i++;
    } else {
      break;
    }
  }

  return max;
}

async function getStockMaxRiseDay(symbol: string) {
  return Storage.getStockHistories(symbol).then((res) => {
    if (res.data) {
      return calculateMaxRiseDay(res.data);
    }
    return null;
  });
}

export async function fillMaxRiseDay(stocks: StockModel[]) {
  const promises: Promise<number | null>[] = [];

  stocks.forEach(async (s) => {
    if (s.symbol) {
      promises.push(getStockMaxRiseDay(s.symbol));
    } else {
      promises.push(
        new Promise<null>((resolve) => {
          resolve(null);
        })
      );
    }
  });

  return Promise.allSettled(promises).then((res) => {
    const newStocks: StockModel[] = [];
    res.forEach((v, i) => {
      if (v.status === "fulfilled") {
        const s = { ...stocks[i] };
        if (v.value) {
          s.maxRiseDay = v.value;
        }
        newStocks.push(s);
      } else {
        newStocks.push({ ...stocks[i] });
      }
    });
    return newStocks;
  });
}
