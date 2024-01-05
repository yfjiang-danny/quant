import * as dotenv from "dotenv";
import { access, constants } from "fs";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import path from "path";
import { StockInfoFieldNames } from "../eastmoney/constant";
import { logger } from "../logs";
import { StockFieldNames } from "../tushare/constant";
import { StockModel } from "../tushare/type";
import { Excel } from "../utils/excel";
import { StockInfoMerge, fillStockInfo } from "./utils";

dotenv.config();

const rootPath = path.resolve(".", ".");

const dbPath = path.resolve(rootPath, "db");

const allStocksFilePath = path.resolve(dbPath, "all_stocks.xlsx");

const filePath = path.resolve(dbPath, "all_capital_stocks.xlsx");

async function saveAllCapitalStock(stocks: StockInfoMerge[]) {
  if (stocks && stocks.length) {
    Excel.saveToExcel({
      columns: { ...StockFieldNames, ...StockInfoFieldNames },
      data: stocks,
      filePath: filePath,
    });
  }
}

function task() {
  access(allStocksFilePath, constants.F_OK, async (err) => {
    if (err) {
      console.log(`${allStocksFilePath} do not exist`);
    } else {
      const preAllStocks = await Excel.read(allStocksFilePath);
      if (preAllStocks && preAllStocks.length > 0) {
        const sheet = preAllStocks[0];
        const allStockData = sheet.data.slice(1);
        const keys = Object.keys(StockFieldNames);

        const allStocks: StockModel[] = [];
        allStockData.forEach((v) => {
          const stock: StockModel = {};
          keys.forEach((key, i) => {
            if (v[i]) {
              stock[key] = v[i];
            }
          });
          allStocks.push(stock);
        });

        const fillResult = await fillStockInfo(allStocks);
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
  scheduleJob("* * 8 * *", task);

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
