import { Storage } from "../service/storage/storage";
import * as dotenv from "dotenv";
import { Queue } from "../utils/queue";
import { TUSHARE_API } from "../third/tushare/api";
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
  logger.info(msg, path.resolve(logRootPath, "collection.time.db.log"));
}

async function snapshot15() {
  const allBasicStocks = await Storage.getStockInfosFromDB();
  if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
    log(`Update 9:15 info failed: empty basic stocks, ${allBasicStocks.msg}`);
    return;
  }

  const dailyStocks = await fillEastStockInfo(allBasicStocks.data);

  if (!dailyStocks || dailyStocks.length == 0) {
    log(`Update 9:15 info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockTimeHistories(15, dailyStocks);

  if (res.data) {
    log(`Update 9:15 info success`);
  } else {
    log(`Update 9:15 info failed: ${res.msg}`);
  }
}

async function snapshot18() {
  const allBasicStocks = await Storage.getStockInfosFromDB();
  if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
    log(`Update 9:18 info failed: empty basic stocks, ${allBasicStocks.msg}`);
    return;
  }

  const dailyStocks = await fillEastStockInfo(allBasicStocks.data);

  if (!dailyStocks || dailyStocks.length == 0) {
    log(`Update 9:18 info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockTimeHistories(18, dailyStocks);

  if (res.data) {
    log(`Update 9:18 info success`);
  } else {
    log(`Update 9:18 info failed: ${res.msg}`);
  }
}

async function snapshot25() {
  const allBasicStocks = await Storage.getStockInfosFromDB();
  if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
    log(`Update 9:25 info failed: empty basic stocks, ${allBasicStocks.msg}`);
    return;
  }

  const dailyStocks = await fillEastStockInfo(allBasicStocks.data);

  if (!dailyStocks || dailyStocks.length == 0) {
    log(`Update 9:25 info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockTimeHistories(25, dailyStocks);

  if (res.data) {
    log(`Update 9:25 info success`);
  } else {
    log(`Update 9:25 info failed: ${res.msg}`);
  }
}

async function snapshot30() {
  const allBasicStocks = await Storage.getStockInfosFromDB();
  if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
    log(`Update 9:30 info failed: empty basic stocks, ${allBasicStocks.msg}`);
    return;
  }

  const dailyStocks = await fillEastStockInfo(allBasicStocks.data);

  if (!dailyStocks || dailyStocks.length == 0) {
    log(`Update 9:30 info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockTimeHistories(30, dailyStocks);

  if (res.data) {
    log(`Update 9:30 info success`);
  } else {
    log(`Update 9:30 info failed: ${res.msg}`);
  }
}

export async function time15Collection(mailer?: Mailer163) {
  if (isHoliday(new Date())) {
    log(`${new Date().toDateString()} is holiday, return`);
    return;
  }

  snapshot15();
}

export async function time18Collection(mailer?: Mailer163) {
  if (isHoliday(new Date())) {
    log(`${new Date().toDateString()} is holiday, return`);
    return;
  }

  snapshot18();
}

export async function time25Collection(mailer?: Mailer163) {
  if (isHoliday(new Date())) {
    log(`${new Date().toDateString()} is holiday, return`);
    return;
  }

  snapshot25();
}

export async function time30Collection(mailer?: Mailer163) {
  if (isHoliday(new Date())) {
    log(`${new Date().toDateString()} is holiday, return`);
    return;
  }

  snapshot30();
}
