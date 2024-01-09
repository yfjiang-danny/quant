import * as dotenv from "dotenv";
import { gracefulShutdown } from "node-schedule";
import path from "path";
import { StockColumns } from "../common/constant";
import { logger } from "../logs";
import { Storage } from "../storage/storage";
import { TUSHARE_API } from "../tushare/api";
import { TushareStockModel } from "../tushare/type";
import { Excel } from "../utils/excel";
import { sleep } from "../utils/sleep";
import { allStocksFilePath, dateString, rootPath } from "./common";

dotenv.config();

function saveToJson(stocks: TushareStockModel[]) {
  return Storage.saveAllBasicStocks(stocks).then((res) => {
    return res.data;
  });
}

async function saveAllStock(stocks: TushareStockModel[]) {
  if (stocks && stocks.length > 0) {
    return Excel.insertToExcel({
      columns: StockColumns,
      data: stocks,
      filePath: allStocksFilePath,
      sheetName: dateString,
    });
  }
  return false;
}

function getAllStocks() {
  return new Promise<boolean>((resolve) => {
    TUSHARE_API.getAllStock().then((res) => {
      if (res) {
        saveToJson(res).then((res) => resolve(res));
        saveAllStock(res);
      } else {
        resolve(false);
      }
    });
  });
}

async function task(repeat: number) {
  let max = repeat;
  let success = false;
  while (!success && max > 0) {
    success = await getAllStocks();
    max--;
    if (!success) {
      await sleep(1000 * 60 * 60 * 60 + 1000 * 60 * 5);
    }
  }
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "all_stocks.log"));
  task(5);
  // 星期1~5 早上 4 点
  // scheduleJob("* * 9 * 1-5", task.bind(null, 5));
  // 每天早上 4 点
  // scheduleJob("* * 4 * *", task.bind(null, 5));

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
