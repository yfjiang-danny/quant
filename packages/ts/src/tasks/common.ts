import moment from "moment";
import path from "path";

export const dateString = moment().format("YYYYMMDD");

export const rootPath = path.resolve(".", ".");

export const dbPath = path.resolve(rootPath, "db");

export const allStocksFilePath = path.resolve(dbPath, "all_stocks.xlsx");

export const allCapitalStocksFilePath = path.resolve(
  dbPath,
  "all_capital_stocks.xlsx"
);

export const minCapitalStocksFilePath = path.resolve(
  dbPath,
  "min_capital_stocks.xlsx"
);

export const filterStocksFilePath = path.resolve(dbPath, "filter_stocks.xlsx");

export const allStocksJsonFilePath = path.resolve(
  dbPath,
  "all",
  `${dateString}.json`
);

export const symbolJsonFilePath = path.resolve(
  dbPath,
  dateString,
  "${code}.json"
);
