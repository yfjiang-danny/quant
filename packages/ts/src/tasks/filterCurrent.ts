import * as dotenv from "dotenv";
import moment from "moment";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { stocksToSheetData } from "../common";
import { StockModel } from "../common/type";
import { logger } from "../logs";
import { Storage } from "../storage/storage";
import { fitTurnover, isCross } from "../strategy";
import { Excel } from "../utils/excel";
import { dbPath, rootPath } from "./common";
import { fillAllStockSMA, fillEastStockInfo } from "./utils";

dotenv.config();

async function filter() {
  const allStocks: StockModel[] = await Storage.getAllStocks().then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
    return res.data;
  });

  if (allStocks.length <= 0) {
    console.log(`Stocks is empty`);

    return;
  }

  const minCapitalStocks = allStocks
    .filter((v) => {
      const symbol = v.symbol;

      const isFitSymbol =
        !symbol ||
        symbol.startsWith("3") ||
        symbol.startsWith("60") ||
        symbol.startsWith("0");
      const capital = v.capital;
      return isFitSymbol && capital && capital < 100;
    })
    .sort((a, b) => (a.capital as number) - (b.capital as number));

  // 获取实时行情
  const newStocks = await fillEastStockInfo(allStocks);

  const crossStocks = newStocks.filter((v) => {
    return isCross(v) && fitTurnover(v, 3, 60);
  });

  if (crossStocks.length <= 0) {
    console.log(`crossStocks is empty`);
    return;
  }

  const sheets: WorkSheet[] = [
    { name: "cross", data: stocksToSheetData(crossStocks), options: {} },
  ];

  const limitedStocks = crossStocks.slice(0, 25);

  const fillSMAStocks = await fillAllStockSMA(limitedStocks);

  sheets.push({
    name: "sma",
    data: stocksToSheetData(fillSMAStocks),
    options: {},
  });

  const filterStocks = fillSMAStocks.filter(
    (v) => v.sma5 && v.sma10 && v.sma20 && v.sma5 > v.sma10 && v.sma10 > v.sma20
  );

  if (filterStocks.length <= 0) {
    console.log(`filterStocks is empty`);
  }

  sheets.push({
    name: "filter",
    data: stocksToSheetData(filterStocks),
    options: {},
  });

  const filePath = path.resolve(
    dbPath,
    `filter_current_${moment().format("YYYYMMDD-hhmmss")}.xlsx`
  );

  Excel.write(sheets, filePath).then(() => console.log(filePath));
}

(function main() {
  logger.setFilePath(
    path.resolve(rootPath, "logs", "filter_current_stocks.log")
  );

  filter();
})();
