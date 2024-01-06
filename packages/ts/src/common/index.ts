import { StockColumns } from "./constant";
import { StockModel } from "./type";

export function excelToStocks(sheetData: any[][]) {
  const allStockData = sheetData.slice(1);
  const keys = Object.keys(StockColumns);

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
  const header: string[] = [];
  columnKeys.forEach((key) => {
    header.push(StockColumns[key]);
  });
  rows.push(header);

  stocks.forEach((v) => {
    const row: unknown[] = [];
    columnKeys.forEach((key, i) => {
      row.push(v[key] || "");
    });
    rows.push(row);
  });

  return rows;
}
