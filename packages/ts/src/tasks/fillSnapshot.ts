import path from "path";
import { KLineToStocks } from "../collection/util";
import { dbQuery } from "../db/connect";
import { IStockSnapshotTable } from "../db/interface/snapshot";
import { StockSnapshotTableModel } from "../db/tables/snapshot";
import { Storage } from "../service/storage/storage";
import { EastMoney_API } from "../third/eastmoney/api";
import { ExecFn, Queue } from "../utils/queue";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import pLimit from "p-limit";

export function getUnFillSymbols() {
  const str = `select symbol
  FROM "stock_snapshots"
  where date='20250523'
  and "updateAt"::date != CURRENT_DATE`;

  return dbQuery<{ symbol: string }[]>({
    text: str,
  }).then((res) => {
    return res.rows as unknown as { symbol: string }[];
  });
}

/**
 *
 */
export async function fillSnapshot() {
  const symbols = await getUnFillSymbols().then((res) => {
    if (res) {
      return res.map((v) => v.symbol).filter((v) => !!v);
    }
    return [];
  });

  if (!Array.isArray(symbols)) return;

  const limit = pLimit(10);

  symbols.map((v) => {
    v && limit(() => fillSnapshotBySymbol(v));
  });

  // let i = 0;
  // while (i < symbols.length) {
  //   const symbol = symbols[i];
  //   i++;
  //   if (!symbol) {
  //     continue;
  //   }
  //   await fillSnapshotBySymbol(symbol);
  // }
}

export async function fillSnapshotBySymbol(symbol: string) {
  const stocks = await EastMoney_API.getStockKline(symbol).then((res) => {
    if (res) {
      // console.log(res.data.klines.reverse().slice(0, 5));

      return KLineToStocks(res);

      // console.log(KLineToStocks(res));
    }
    return [];
  });

  if (!stocks || stocks.length == 0) return;

  console.log(symbol, stocks.length);

  await insert(stocks);
}

function insert(stocks: StockSnapshotTableModel[]) {
  return IStockSnapshotTable.insert(stocks, true);
}
