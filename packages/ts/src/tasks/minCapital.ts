import * as dotenv from "dotenv";
import { access, constants } from "fs";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import path from "path";
import { logger } from "../logs";
import { Excel } from "../utils/excel";
import { StockColumns } from "../common/constant";

dotenv.config();

const rootPath = path.resolve("..", "..");

const dbPath = path.resolve(rootPath, "src", "db");

const allCapitalStocksFilePath = path.resolve(
  dbPath,
  "all_capital_stocks.xlsx"
);

const filePath = path.resolve(dbPath, "min_capital_stocks.xlsx");

function task() {
  access(allCapitalStocksFilePath, constants.F_OK, async (err) => {
    if (err) {
      console.log(`${allCapitalStocksFilePath} do not exist`);
    } else {
      const preAllStocks = await Excel.read(allCapitalStocksFilePath);
      if (preAllStocks && preAllStocks.length > 0) {
        const sheet = preAllStocks[0];
        const capitalIndex = Object.keys(StockColumns).findIndex(
          (v) => v === "capital"
        );

        if (capitalIndex === -1) {
          console.log(`capital column do not exist in StockMergeColumns`);
          return;
        }

        const minCapitalStockData = sheet.data.filter((v, i) => {
          if (i === 0) {
            return true;
          }
          return v[capitalIndex] && v[capitalIndex] < 100;
        });

        Excel.append(
          [{ name: sheet.name, data: minCapitalStockData, options: {} }],
          filePath,
          true
        );
      }
    }
  });
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "min_capital_stocks.log"));
  // 每天早上 9 点
  scheduleJob("* * 9 * *", task);

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
