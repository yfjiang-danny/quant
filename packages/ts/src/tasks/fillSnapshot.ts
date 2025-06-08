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
  where date='20250606'
  and "update_at"::date != CURRENT_DATE
  order by symbol desc
  limit 200`;

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

  if (symbols.length == 0) {
    console.log(`fillSnapshot finished`);

    return;
  }

  const limit = pLimit(10);

  symbols.map((v) => {
    v && limit(() => fillSnapshotBySymbol(v));
  });
}

export async function fillSnapshotBySymbol(symbol: string) {
  const stocks = await EastMoney_API.getStockKline(symbol, "20240101").then(
    (res) => {
      if (res) {
        const klines = KLineToStocks(res);
        console.log(symbol, klines.length);

        return klines;
      }
      return [];
    }
  );

  if (!stocks || stocks.length == 0) return;

  await insert(stocks);
}

function insert(stocks: StockSnapshotTableModel[]) {
  return IStockSnapshotTable.insert(stocks, true);
}
