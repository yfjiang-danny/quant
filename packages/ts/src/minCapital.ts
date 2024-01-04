import { access, constants } from "fs";
import path from "path";
import { Excel } from "./utils/excel";

const dbPath = path.resolve(".", ".", "db");

const allStocksFilePath = path.resolve(dbPath, "all_stocks.xlsx");

const filePath = path.resolve(dbPath, "min_stocks.xlsx");

export function saveMinCapital() {
  access(filePath, constants.F_OK, (err) => {
    if (err) {
      const preMinStocks = Excel.read(allStocksFilePath);
    } else {
      //
    }
  });
}
