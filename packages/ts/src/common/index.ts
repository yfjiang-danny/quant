import { StockColumns } from "../models/constant";
import { StockModel } from "../models/type";

export function excelToStocks(sheetData: any[][]) {
  const allStockData = sheetData.slice(2);
  const keys = sheetData[0];

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
  return allStocks;
}

export function stocksToSheetData(stocks: StockModel[]) {
  const rows: unknown[][] = [];

  const columnKeys = Object.keys(StockColumns);

  rows.push(columnKeys);

  const header: string[] = [];
  columnKeys.forEach((key) => {
    header.push(StockColumns[key]);
  });
  rows.push(header);

  stocks.forEach((v) => {
    const row: unknown[] = [];
    columnKeys.forEach((key, i) => {
      row.push(v[key] || undefined);
    });
    rows.push(row);
  });

  return rows;
}
