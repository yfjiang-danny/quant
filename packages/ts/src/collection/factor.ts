import moment from "moment";
import { Storage } from "../service/storage/storage";
import { StockModel } from "../models/type";
import pLimit from "p-limit";
import { fillOneStockSMA, fillStocksSMA } from "../service/factors/sma";
import { StockFactorTableModel } from "../db/tables/factor";
import { batchTask } from "../utils/util";
import { StockSnapshotTable } from "../db/tables/snapshot";

async function fillSMABySymbol(symbol: string, date: string) {
  const stockHistories = await Storage.getStockHistoriesFromDB(
    symbol,
    undefined,
    undefined,
    [
      StockSnapshotTable.date.lte(date),
      StockSnapshotTable.close.isNotNull(),
      StockSnapshotTable.open.isNotNull(),
    ]
  ).then((res) => res.data);

  const smaStocks = fillOneStockSMA(stockHistories as unknown as StockModel[]);

  const stockFactors = smaStocks.map((v) => {
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

  if (smaStocks && smaStocks.length > 0) {
    await Storage.insertFactors(stockFactors);
  }
}

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

  const promises: Promise<void>[] = [];

  batchTask(allStocks, 20, (stocks) => {
    promises.push(limit(() => fillSMATask(stocks)));
  });

  await Promise.allSettled(promises);
}

export async function collectFactorBySymbol(date: string) {
  if (!date) {
    date = moment().format("YYYYMMDD");
  }
  const allStocks = await Storage.getStockSnapshotByDate(date).then(
    (res) => res.data
  );

  // fillSMABySymbol("000001", date);
  const limit = pLimit(20);

  allStocks.forEach((v) => {
    limit(() => fillSMABySymbol(v.symbol!, date));
  });
}
