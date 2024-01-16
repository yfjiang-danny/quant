import { StockModel } from "../common/type";
import { EastMoney_API } from "../eastmoney/api";
import { EastMoneyStockModel, MarketType } from "../eastmoney/type";
import { logger } from "../logs";
import { fillStockSMA } from "../sma";
import { StockWithSMA } from "../sma/type";
import { TushareStockModel } from "../tushare/type";

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
export async function fillEastStockInfo(
  stocks: TushareStockModel[]
): Promise<StockModel[]> {
  logger.info("fillEastStockInfo start...\n");

  const res: StockModel[] = [];

  const len = Math.round(stocks.length / batch);

  let i = 0;
  while (i < len) {
    const from = i * batch;
    const to = from + batch;
    const arr = stocks.slice(from, to);
    if (arr.length > 0) {
      const promises: Promise<EastMoneyStockModel | null>[] = [];
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

      logger.info(`batch ${i}: [${from}, ${to}], total ${len}`);

      const responses = await Promise.all(promises);
      responses.forEach((v, j) => {
        if (v) {
          res.push({ ...arr[j], ...v });
        } else {
          res.push({ ...arr[j] } as StockModel);
        }
      });
    }
    i++;
  }

  logger.info("fillEastStockInfo finished");
  return res;
}

/**
 * Use alph api to calculate sma and filled to stock
 */
export async function fillAllStockSMA(stocks: StockModel[]) {
  logger.info("fillAllStockSMA start...");
  const res: StockModel[] = [];

  const len = Math.round(stocks.length / batch);

  let i = 0;
  while (i < len) {
    const arr = stocks.slice(i * batch, (i + 1) * batch);
    if (arr.length > 0) {
      const promises: Promise<StockWithSMA>[] = [];
      arr.forEach((v) => {
        promises.push(fillStockSMA(v));
      });

      const responses = await Promise.all(promises);
      responses.forEach((v, i) => {
        if (v) {
          res.push({ ...arr[i], ...v } as StockModel);
        } else {
          res.push({ ...arr[i] } as StockModel);
        }
      });
    }
    i++;
  }

  logger.info("fillAllStockSMA finished...");
  return res;
}
