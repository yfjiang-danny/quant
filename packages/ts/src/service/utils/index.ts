import { logger } from "../../logs";
import { ALPHStockModel } from "../../third/alph/type";
import { EastMoneyStockModel } from "../../third/eastmoney/type";
import { TushareStockModel } from "../../third/tushare/type";
import { StockModel } from "../../models/type";
import { getMarket } from "../../utils/convert";
import { ALPH_API } from "../../third/alph/api";
import { EastMoney_API } from "../../third/eastmoney/api";
import { Storage } from "../storage/storage";
import {
  StockSnapshotTableModel,
  StockTimeSnapshotTableModel,
} from "../../db/tables/snapshot";
import { FileStorage } from "../storage/fileStorage";

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

  const len = Math.ceil(stocks.length / batch);

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

export function fillStockHistoryByALPH(stock: StockModel) {
  return new Promise<boolean>((resolve) => {
    if (stock.ts_code) {
      ALPH_API.getStockDaily(stock.ts_code).then(
        (histories: ALPHStockModel[] | null) => {
          if (histories) {
            FileStorage.saveStocks(histories.map((v) => ({ v, ...stock })))
              .then((res) => {
                if (res.msg) {
                  console.log(res.msg);
                }
              })
              .catch((e) => {
                console.log(e);
              })
              .finally(() => resolve(true));
          } else {
            resolve(true);
          }
        },
        (e) => {
          console.log(e);
          resolve(true);
        }
      );
    } else {
      resolve(true);
    }
  });
}

export function convertToHistoryModel(v: StockModel): StockSnapshotTableModel {
  function toString(v: any) {
    return v ? String(v) : null;
  }
  return {
    date: v.date,
    time: v.time,
    name: v.name,
    symbol: v.symbol,
    change: v.change,
    close: toString(v.close),
    open: toString(v.open),
    high: toString(v.high),
    low: toString(v.low),
    avg: toString(v.avg),
    top_price: toString(v.topPrice),
    bottom_price: toString(v.bottomPrice),
    turnover: toString(v.turnover),
    volume: toString(v.volume),
    external: v.external,
    internal: v.internal,
    buy1: v.buy1,
    buy2: v.buy2,
    sale1: v.sale1,
    sale2: v.sale2,
    sale1_count: v.sale1_count,
    sale2_count: v.sale2_count,
    buy1_count: v.buy1_count,
    buy2_count: v.buy2_count,
  } as StockSnapshotTableModel;
}

export function convertToHistoryTimeModel(
  v: StockModel
): StockTimeSnapshotTableModel {
  function toString(v: any) {
    return v ? String(v) : null;
  }
  return {
    date: v.date,
    time: v.time,
    name: v.name,
    symbol: v.symbol,
    change: v.change,
    close: toString(v.close),
    open: toString(v.open),
    high: toString(v.high),
    low: toString(v.low),
    avg: toString(v.avg),
    top_price: toString(v.topPrice),
    bottom_price: toString(v.bottomPrice),
    turnover: toString(v.turnover),
    volume: toString(v.volume),
    external: v.external,
    internal: v.internal,
    buy1: v.buy1,
    buy2: v.buy2,
    sale1: v.sale1,
    sale2: v.sale2,
    sale1_count: v.sale1_count,
    sale2_count: v.sale2_count,
    buy1_count: v.buy1_count,
    buy2_count: v.buy2_count,
  } as StockTimeSnapshotTableModel;
}

export function getLimitPercentage(symbol?: string): number {
  if (!symbol) return 0;
  return symbol?.startsWith("0") || symbol?.startsWith("60")
    ? 0.1
    : symbol?.startsWith("8") || symbol?.startsWith("4")
    ? 0.3
    : 0.2;
}

export function calcTopPriceLimit(stock: StockModel) {
  const close = Number(stock.close);
  const maxChange = getLimitPercentage(stock.symbol);
  return (close * (1 + maxChange)).toFixed(2);
}

export function calcBottomPriceLimit(stock: StockModel) {
  const close = Number(stock.close);
  const maxChange = getLimitPercentage(stock.symbol);
  return (close * (1 - maxChange)).toFixed(2);
}
