import * as dotenv from "dotenv";
import { access, constants } from "fs";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import path from "path";
import { logger } from "../logs";
import { Excel } from "../utils/excel";
import { StockColumns } from "../common/constant";
import {
  allCapitalStocksFilePath,
  minCapitalStocksFilePath,
  rootPath,
} from "./common";
import { StockModel } from "../common/type";

dotenv.config();

function task() {
  access(allCapitalStocksFilePath, constants.F_OK, async (err) => {
    if (err) {
      console.log(`${allCapitalStocksFilePath} do not exist`);
    } else {
      const preAllStocks = await Excel.read(allCapitalStocksFilePath);
      if (preAllStocks && preAllStocks.length > 0) {
        const sheet = preAllStocks[preAllStocks.length - 1];
        const capitalIndex = sheet.data[0].findIndex((v) =>
          (v as string).includes("capital")
        );

        if (capitalIndex === -1) {
          console.log(`capital column do not exist in StockMergeColumns`);
          return;
        }

        const symbolIndex = sheet.data[0].findIndex((v) => v === "symbol");

        const turnoverIndex = sheet.data[0].findIndex((v) =>
          (v as string).includes("turnover")
        );

        const minCapitalStockData = sheet.data.filter((v, i) => {
          if (i === 0 || i === 1) {
            return true;
          }
          const symbol = v[symbolIndex] as string;

          const isFitSymbol =
            !symbol ||
            symbol.startsWith("3") ||
            symbol.startsWith("60") ||
            symbol.startsWith("0");
          const capital = v[capitalIndex];
          return isFitSymbol && capital && capital < 50;
        });

        Excel.append(
          { name: sheet.name, data: minCapitalStockData, options: {} },
          minCapitalStocksFilePath,
          true
        );
      }
    }
  });
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "min_capital_stocks.log"));
  // 每天早上 9 点
  // scheduleJob("* * 9 * *", task);
  task();

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
