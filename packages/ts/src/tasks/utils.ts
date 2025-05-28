import { logger } from "../logs";
import { EastMoneyStockModel, MarketType } from "../third/eastmoney/type";
import { StockWithSMA } from "../models/sma/type";
import { TushareStockModel } from "../third/tushare/type";
import { StockModel } from "../models/type";
import { EastMoney_API } from "../third/eastmoney/api";
import { fillStockSMA } from "../service/factors/sma";
import { createDir } from "../utils/fs";
import path from "path";
import { imgRootPath } from "../common/paths";
import moment from "moment";
import { drawTable } from "../utils/canvas";
import Mail from "nodemailer/lib/mailer";
import { access, readdir } from "fs/promises";
import * as fs from "fs";

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
            EastMoney_API.queryRealtime(v.symbol, getMarket(v.symbol))
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
        // @ts-ignore
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

export function drawCodeToImg(stocks: StockModel[], fileDir?: string) {
  const d = stocks[0].date;
  const defaultFileDir = path.resolve(
    imgRootPath,
    d || moment().format(`YYYYMMDD`)
  );

  const dir = fileDir || defaultFileDir;

  return new Promise<string[] | undefined>((resolve, reject) => {
    if (stocks.length <= 0) {
      resolve(undefined);
    }
    createDir(dir)
      .then(() => {
        const promise: Promise<string | undefined>[] = [];
        const newArr = Array.from(stocks);
        let i = 0;
        while (newArr.length > 0) {
          i++;
          promise.push(
            drawTable(
              [
                // { key: "name", name: "股票名称", width: 140 },
                { key: "symbol", name: "股票代码", width: 140 },
              ],
              newArr.splice(0, 15) as Record<string, string | number>[],
              `${i}`,
              dir
            )
          );
        }
        Promise.allSettled(promise)
          .then((res) => {
            const files = res.reduce((res, cur) => {
              if (cur.status === "fulfilled") {
                if (typeof cur.value === "string") {
                  res.push(cur.value);
                }
              }
              return res;
            }, [] as string[]);
            resolve(files);
          })
          .catch((e) => {
            reject(e);
          });
      })
      .catch((e) => {
        //
        reject(e);
      });
  });
}
