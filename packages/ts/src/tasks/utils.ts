import { EastMoney_API } from "../eastmoney/api";
import { MarketType, StockInfoModel } from "../eastmoney/type";
import { StockModel } from "../tushare/type";

export type StockInfoMerge = StockModel & StockInfoModel;

function getMarket(symbol: string): MarketType {
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

const batch = 10;

/**
 * Use east money api to fill stock info
 * @param stocks
 * @returns
 */
export async function fillStockInfo(
  stocks: StockModel[]
): Promise<StockInfoMerge[]> {
  const res: StockInfoMerge[] = [];

  const len = Math.round(stocks.length / batch);

  let i = 0;
  while (i < len) {
    const arr = stocks.slice(i, i + batch);
    if (arr.length > 0) {
      const promises: Promise<StockInfoModel | null>[] = [];
      arr.forEach((v) => {
        if (v.symbol) {
          promises.push(
            EastMoney_API.getStockInfo(v.symbol, getMarket(v.symbol))
          );
        } else {
          promises.push(
            new Promise<null>((resolve) => {
              resolve(null);
            })
          );
        }
      });
      const responses = await Promise.all(promises);
      responses.forEach((v, i) => {
        if (v) {
          res.push({ ...arr[i], ...v });
        } else {
          res.push({ ...arr[i] } as StockInfoMerge);
        }
      });
    }
    i++;
  }

  return res;
}
