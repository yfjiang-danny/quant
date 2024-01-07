import * as dotenv from "dotenv";
import { Excel } from "../utils/excel";
import {
  filterStocksFilePath,
  minCapitalStocksFilePath,
  rootPath,
} from "./common";
import { StockModel } from "../common/type";
import { excelToStocks } from "../common";
import { fitTurnover, isCross } from "../strategy";
import { StockColumns } from "../common/constant";
import path from "path";
import { logger } from "../logs";
import { gracefulShutdown, scheduleJob } from "node-schedule";

dotenv.config();

async function filter() {
  const preMinCapitalStocks = await Excel.read(minCapitalStocksFilePath);
  if (preMinCapitalStocks && preMinCapitalStocks.length > 0) {
    const sheet = preMinCapitalStocks[0];

    const allStocks: StockModel[] = excelToStocks(sheet.data);

    const filterStocks = allStocks.filter((v) => {
      return isCross(v) && fitTurnover(v, 3, 60);
    });

    if (filterStocks && filterStocks.length > 0) {
      await Excel.insertToExcel({
        columns: StockColumns,
        data: filterStocks,
        filePath: filterStocksFilePath,
      });
    }
  }
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "filter_stocks.log"));

  // 星期1~5 早上 9 点
  //   scheduleJob("* * 9 * 1-5", filter);
  filter();

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
