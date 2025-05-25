import { StockSnapshotTableModel } from "../../db/tables/snapshot";
import { EastMoneyStockKLineResponseModel } from "./type";

export function kLineToStocks(
  kLine?: EastMoneyStockKLineResponseModel
): StockSnapshotTableModel[] {
  try {
    const res: StockSnapshotTableModel[] = [];
    kLine?.data.klines.forEach((v) => {
      const arr = v.split(",");
      if (arr && arr.length === 11) {
        res.push({
          symbol: kLine.data.code,
          name: kLine.data.name,
          date: arr[0].replace(/-/g, ""),
          open: arr[1],
          close: arr[2],
          high: arr[3],
          low: arr[4],
          volume: arr[5],
          change: arr[9],
          turnover: arr[10],
          avg: null,
          bottom_price: null,
          buy1: null,
          buy1_count: null,
          buy2: null,
          buy2_count: null,
          external: null,
          internal: null,
          sale1: null,
          sale1_count: null,
          sale2: null,
          sale2_count: null,
          time: null,
          top_price: null,
        });
      }
    });
    return res;
  } catch (error) {
    return [];
  }
}
