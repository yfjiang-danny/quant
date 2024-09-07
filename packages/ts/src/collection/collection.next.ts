import * as dotenv from "dotenv";
import { Queue } from "../utils/queue";
import { TUSHARE_API } from "../third/tushare/api";
import { Storage } from "../service/storage/storage";
import { fillEastStockInfo } from "../service/utils";
import { Mailer163 } from "../mail";
import { logger } from "../logs";
import path from "path";
import { logRootPath } from "../common/paths";
import { fillingLadder } from "./derivative";
import { isHoliday } from "chinese-calendar-ts";

dotenv.config();

const queue = new Queue();

function log(msg: unknown) {
  logger.info(msg, path.resolve(logRootPath, "collection.db.log"));
}

async function stockInfo() {
  const allBasicStocks = await TUSHARE_API.getAllStock();
  if (allBasicStocks && allBasicStocks.length > 0) {
    const res = await Storage.insertStockInfos(allBasicStocks);
    if (!res.data) {
      log(`Update stock info failed: ${res.msg}`);
    } else {
      log(`Update stock info success`);
    }
  } else {
    log(`Update stock info failed: TUSHARE_API.getAllStock is null`);
  }
}

async function snapshot() {
  const allBasicStocks = await Storage.getStockInfosFromDB();
  if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
    log(`Update daily info failed: empty basic stocks, ${allBasicStocks.msg}`);
    return;
  }

  const dailyStocks = await fillEastStockInfo(allBasicStocks.data);

  if (!dailyStocks || dailyStocks.length == 0) {
    log(`Update daily info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockHistories(dailyStocks);

  if (res.data) {
    log(`Update daily info success`);
  } else {
    log(`Update daily info failed: ${res.msg}`);
  }
}

export async function dailyCollection(mailer?: Mailer163) {
  if (isHoliday(new Date())) {
    log(`${new Date().toDateString()} is holiday, return`);
    return;
  }

  queue.process(({ data }, done) => {
    if (typeof data === "function") {
      const res = data();
      if (res && typeof res.then === "function") {
        res.then(
          () => {
            done();
          },
          () => {
            done();
          }
        );
      } else {
        done();
      }
    } else {
      done();
    }
  });
  queue.setLast(() => {
    log("Daily collection complete");
  });

  queue.add(stockInfo);
  queue.add(snapshot);
  queue.add(fillingLadder);
}
