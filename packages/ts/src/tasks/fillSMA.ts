import * as dotenv from "dotenv";
import { logger } from "../logs";
import path from "path";
import { StockModel } from "../common/type";
import { access, constants } from "fs";
import { Excel } from "../utils/excel";
import { filterStocksFilePath, rootPath } from "./common";
import { fillAllStockSMA } from "./utils";
import { excelToStocks, stocksToSheetData } from "../common";
import { scheduleJob } from "node-schedule";

dotenv.config();

function fillSMATask() {
  access(filterStocksFilePath, constants.F_OK, async (err) => {
    if (err) {
      console.log(`${filterStocksFilePath} do not exist`);
    } else {
      const allSheets = await Excel.read(filterStocksFilePath);
      if (allSheets && allSheets.length > 0) {
        const sheet = allSheets[0];
        const allStocks: StockModel[] = excelToStocks(sheet.data);

        const fillResult = await fillAllStockSMA(allStocks);

        const sheetData = stocksToSheetData(fillResult);

        allSheets[0] = {
          name: sheet.name + "sma",
          data: sheetData,
        };
      }
      if (allSheets) {
        Excel.write(
          allSheets.map((v) => {
            return { ...v, options: {} };
          }),
          filterStocksFilePath
        );
      }
    }
  });
}

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "sma.log"));

  // 每天早上 4 点
  // scheduleJob("* 30 8 * *", fillSMATask);
  fillSMATask();
})();
