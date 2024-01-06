import * as dotenv from "dotenv";
import moment from "moment";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { logger } from "../logs";
import { TUSHARE_API } from "../tushare/api";
import { TushareStockColumns } from "../tushare/constant";
import { TushareStockModel } from "../tushare/type";
import { Excel } from "../utils/excel";
import { sleep } from "../utils/sleep";
import { allStocksFilePath, dateString, rootPath } from "./common";
import { StockColumns } from "../common/constant";

dotenv.config();

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
        saveAllStock(res).then((res) => resolve(res));
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
  // task(5);
  // 星期1~5 早上 4 点
  // scheduleJob("* * 9 * 1-5", task.bind(null, 5));
  // 每天早上 4 点
  scheduleJob("* * 4 * *", task.bind(null, 5));

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
