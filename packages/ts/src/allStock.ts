import { WorkSheet } from "node-xlsx";
import { TUSHARE_API } from "./tushare/api";
import { TushareStockColumns } from "./tushare/constant";
import { Excel } from "./utils/excel";

import moment from "moment";
import path from "path";
import { TushareStockModel } from "./tushare/type";

const rootPath = path.resolve(".", ".");

const dateString = moment().format("YYYYMMDD");

export async function saveAllStock(stocks: TushareStockModel[]) {
  if (stocks) {
    const rows: unknown[][] = [];
    const columnKeys = Object.keys(TushareStockColumns);
    const header: string[] = [];
    columnKeys.forEach((key) => {
      header.push(TushareStockColumns[key]);
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

export async function getAllStocks() {
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
