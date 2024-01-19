import * as dotenv from "dotenv";
import { logger } from "../../logs";
import { TushareStockModel } from "../../models/tushare/type";
import { StockModel } from "../../models/type";
import { Storage } from "../storage/storage";
import { TUSHARE_API } from "../tushare/api";
import { fillEastStockInfo, fillStockHistoryByALPH } from "../utils";
import { fillStocksSMA } from "../factors/sma";

dotenv.config();

let alphTaskStocks: StockModel[];

async function fillHistoryByALPH() {
  logger.info(`FillHistoryByALPH start...`);
  if (!alphTaskStocks || alphTaskStocks.length <= 0) {
    alphTaskStocks = (
      await Storage.getAllStocks().then((res) => res.data)
    ).filter((v) => {
      !!v.ts_code;
    });
  }

  if (alphTaskStocks.length > 0) {
    const arr = alphTaskStocks.splice(0, 25);

    const promises: Promise<boolean>[] = [];

    arr.forEach((v) => {
      promises.push(fillStockHistoryByALPH(v));
    });

    Promise.allSettled(promises)
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        logger.info(`FillHistoryByALPH end...`);
      });
  } else {
    logger.info(`FillHistoryByALPH end...`);
  }
}

function getAllStocks() {
  return new Promise<TushareStockModel[] | null>((resolve) => {
    TUSHARE_API.getAllStock().then((res) => {
      if (res) {
        Storage.saveAllBasicStocks(res).then(
          (success) => {
            if (success) {
              resolve(res);
            } else {
              resolve(null);
            }
          },
          (e) => {
            console.log(e);

            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  });
}

function fillTradeInfo(stocks: TushareStockModel[] | null) {
  return new Promise<StockModel[]>((resolve) => {
    if (stocks) {
      fillEastStockInfo(stocks).then((fillStocks) => {
        resolve(fillStocks);
      });
    } else {
      console.log(`BasicStocks is null, call Storage.getAllBasicStocks`);

      Storage.getAllBasicStocks().then((res) => {
        if (res.msg) {
          console.log(res.msg);
        } else {
          const allStocks = res.data;
          fillEastStockInfo(allStocks).then((fillStocks) => {
            resolve(fillStocks);
          });
        }
      });
    }
  });
}

export async function collectionTask() {
  logger.info(`Start collection task`);

  // 使用示例
  const allBasicStocks = await getAllStocks();

  const fillResult = await fillTradeInfo(allBasicStocks);

  const smaResult = await fillStocksSMA(fillResult);

  await Storage.saveStocksInOneDate(smaResult).then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
  });

  fillHistoryByALPH();
}
