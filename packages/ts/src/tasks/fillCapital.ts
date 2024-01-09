import * as dotenv from "dotenv";
import { access, constants } from "fs";
import { gracefulShutdown } from "node-schedule";
import path from "path";
import { excelToStocks } from "../common";
import { StockColumns } from "../common/constant";
import { StockModel } from "../common/type";
import { logger } from "../logs";
import { Storage } from "../storage/storage";
import { Excel } from "../utils/excel";
import {
  allCapitalStocksFilePath,
  allStocksFilePath,
  allStocksJsonFilePath,
  rootPath,
} from "./common";
import { fillEastStockInfo } from "./utils";

dotenv.config();

async function saveAllCapitalStock(stocks: StockModel[]) {
  if (stocks && stocks.length) {
    return Excel.insertToExcel({
      columns: StockColumns,
      data: stocks,
      filePath: allCapitalStocksFilePath,
    });
  }
  return false;
}

function jsonTask() {
  access(allStocksJsonFilePath, constants.F_OK, async (err) => {
    Storage.getAllBasicStocks().then(async (res) => {
      if (res.msg) {
        console.log(res.msg);
      } else {
        const allStocks = res.data;
        const fillResult = await fillEastStockInfo(allStocks);
        Storage.saveStocks(fillResult).then((res) => {
          if (res.msg) {
            console.log(res.msg);
          }
        });
      }
    });
  });
}

function task() {
  access(allStocksFilePath, constants.F_OK, async (err) => {
    if (err) {
      console.log(`${allStocksFilePath} do not exist`);
    } else {
      const preAllStocks = await Excel.read(allStocksFilePath);
      if (preAllStocks && preAllStocks.length > 0) {
        const sheet = preAllStocks[preAllStocks.length - 1];

        const allStocks: StockModel[] = excelToStocks(sheet.data);

        const fillResult = await fillEastStockInfo(allStocks);
        if (fillResult) {
          await saveAllCapitalStock(fillResult);
        }
      }
    }
  });
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "all_capital_stocks.log"));
  // 每天早上 4 点
  // scheduleJob("* * 8 * *", task);
  jsonTask();

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
