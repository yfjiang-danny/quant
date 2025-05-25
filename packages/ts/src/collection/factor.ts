import moment from "moment";
import { Storage } from "../service/storage/storage";
import { StockModel } from "../models/type";
import pLimit from "p-limit";
import { fillStocksSMA } from "../service/factors/sma";
import { StockFactorTableModel } from "../db/tables/factor";
import { batchTask } from "../utils/util";

async function fillSMATask(stocks: StockModel[]) {
  const smaStocks = await fillStocksSMA(stocks).then((res) => {
    if (res) {
      return res.map((v) => {
        const stock = {
          date: v.date,
          symbol: v.symbol,
          sma5: v.sma5 ? v.sma5.toFixed(2) : undefined,
          sma10: v.sma10 ? v.sma10.toFixed(2) : undefined,
          sma20: v.sma20 ? v.sma20.toFixed(2) : undefined,
          sma60: v.sma60 ? v.sma60.toFixed(2) : undefined,
          sma120: v.sma120 ? v.sma120.toFixed(2) : undefined,
        } as StockFactorTableModel;
        if (v.volume && v.turnover && v.close) {
          const capital =
            ((v.volume / (v.turnover / 100)) * v.close) / Math.pow(10, 6);
          stock.flow_capital = Number(capital.toFixed(2)).toString();
        }
        return stock;
      });
    }
  });

  if (smaStocks && smaStocks.length > 0) {
    await Storage.insertFactors(smaStocks);
  }
}

export async function collectFactor(date?: string) {
  if (!date) {
    date = moment().format("YYYYMMDD");
  }
  const allStocks = await Storage.getStockSnapshotByDate(date).then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
    return res.data.reduce((arr, v) => {
      if (v.close) {
        arr.push({ ...v, close: Number(v.close) } as unknown as StockModel);
      }
      return arr;
    }, [] as StockModel[]);
  });

  const limit = pLimit(5);
  batchTask(allStocks, 10, (stocks) => {
    limit(() => fillSMATask(stocks));
  });
}
