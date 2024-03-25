import * as dotenv from "dotenv";
import { logger } from "../../logs";
import { Mailer163 } from "../../mail";
import { StockModel } from "../../models/type";
import { fillStocksSMA } from "../factors/sma";
import { Storage } from "../storage/storage";
import { TUSHARE_API } from "../tushare/api";
import { fillEastStockInfo, fillStockHistoryByALPH } from "../utils";

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

export async function collectionTask(mailer?: Mailer163) {
  logger.info(`Start collection task`);

  //
  let allBasicStocks = await TUSHARE_API.getAllStock();

  if (!allBasicStocks || allBasicStocks.length <= 0) {
    console.log(`TUSHARE_API is null, call Storage.getAllBasicStocks`);
    allBasicStocks = await Storage.getAllBasicStocks().then((res) => {
      if (res.msg) {
        console.log(res.msg);
      }
      return res.data;
    });
  } else {
    await Storage.saveAllBasicStocks(allBasicStocks);
    await Storage.insertStockInfos(allBasicStocks);
  }

  if (!allBasicStocks || allBasicStocks.length <= 0) {
    console.log(`allBasicStocks is empty, collection task stop.`);

    return;
  }

  const fillResult = await fillEastStockInfo(allBasicStocks);

  if (!fillResult || fillResult.length <= 0) {
    console.log(`fillTradeInfo is empty. collection task stop.`);
    return;
  }

  Storage.insertStockHistories(fillResult);

  const smaResult = await fillStocksSMA(fillResult);

  if (!smaResult || smaResult.length <= 0) {
    console.log(`fillStocksSMA is empty`);
  }

  await Storage.saveStocks(smaResult || fillResult, true).then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
  });

  await fillHistoryByALPH();

  console.log(`Collection Task complete`);

  mailer
    ?.send({
      to: "michael593@163.com",
      subject: "collection",
      text: `Collection Task complete`,
    })
    .then((res) => {
      logger.info(res);
    })
    .catch((e) => {
      logger.info(e);
    });
}
