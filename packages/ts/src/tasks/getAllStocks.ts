import * as dotenv from "dotenv";
import moment from "moment";
import { gracefulShutdown } from "node-schedule";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { TUSHARE_API } from "../tushare/api";
import { StockFieldNames } from "../tushare/constant";
import { StockModel } from "../tushare/type";
import { Excel } from "../utils/excel";
import { sleep } from "../utils/sleep";

dotenv.config();

const rootPath = path.resolve(".", ".");

const dateString = moment().format("YYYYMMDD");

async function saveAllStock(stocks: StockModel[]) {
  if (stocks) {
    const rows: unknown[][] = [];
    const columnKeys = Object.keys(StockFieldNames);
    const header: string[] = [];
    columnKeys.forEach((key) => {
      header.push(StockFieldNames[key]);
    });
    rows.push(header);
    stocks.forEach((v) => {
      const row: unknown[] = [];
      columnKeys.forEach((key, i) => {
        row.push(v[key] || "");
      });
      rows.push(row);
    });
    const newSheet: WorkSheet = {
      name: dateString,
      data: rows,
      options: {},
    };
    const filePath = path.resolve(rootPath, "db", "all_stock.xlsx");
    const newXlsx: WorkSheet[] = [newSheet];
    const oldData = await Excel.read(filePath);
    if (oldData) {
      oldData.forEach((v) => {
        newXlsx.push({
          ...v,
          options: {},
        });
      });
    }
    return Excel.write(newXlsx, filePath);
  }
  return new Promise<boolean>((resolve) => {
    resolve(false);
  });
}

function getAllStocks() {
  return new Promise<boolean>((resolve) => {
    TUSHARE_API.getAllStock().then((res) => {
      if (res) {
        console.log(JSON.stringify(res));

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
  task(5);
  // 星期1~5 早上 4 点
  // scheduleJob("* * 9 * 1-5", task.bind(null, 5));

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
