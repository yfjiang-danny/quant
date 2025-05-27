import { StockSnapshotTableModel } from "../db/tables/snapshot";
import { EastMoneyStockKLineResponseModel } from "../third/eastmoney/type";

export function KLineToStocks(
  kLine?: EastMoneyStockKLineResponseModel
): StockSnapshotTableModel[] {
  try {
    const res: StockSnapshotTableModel[] = [];
    kLine?.data.klines.forEach((v) => {
      const arr = v.split(",");
      if (arr && arr.length === 11) {
        // @ts-ignore
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
        });
      }
    });
    return res;
  } catch (error) {
    return [];
  }
}
