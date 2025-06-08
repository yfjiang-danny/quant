import * as dotenv from "dotenv";
import pLimit from "p-limit";
import { dbQuery } from "../db/connect";
import { StockSnapshotTable } from "../db/tables/snapshot";
import { StockModel } from "../models/type";
import { Storage } from "../service/storage/storage";
import { calcBottomPriceLimit, calcTopPriceLimit } from "../service/utils";
import { getLatestTradeDates } from "../utils/date";
import { batchTask } from "../utils/util";
dotenv.config();

function getAllSymbol() {
  const str = `select symbol
  FROM "stock_snapshots"
  group by symbol`;

  return dbQuery<{ symbol: string }[]>({
    text: str,
  }).then((res) => {
    return res.rows as unknown as { symbol: string }[];
  });
}

async function updateStockLimited(symbol: string) {
  const stocks = await Storage.getStockHistoriesFromDB(
    symbol,
    undefined,
    undefined,
    [
      StockSnapshotTable.open.isNotNull(),
      StockSnapshotTable.close.isNotNull(),
      StockSnapshotTable.change.isNotNull(),
    ]
  ).then((res) => res.data);

  if (!stocks || stocks.length <= 0) return;

  await Storage.updateStockHistories(
    stocks.map((v) => {
      const pre_close = Number(v.close) - Number(v.change);
      const nv = {
        ...v,
      };

      if (!isNaN(pre_close)) {
        nv.top_price = calcTopPriceLimit({
          ...v,
          close: pre_close,
        } as unknown as StockModel);
        nv.bottom_price = calcBottomPriceLimit({
          ...v,
          close: pre_close,
        } as unknown as StockModel);
      }

      return nv;
    })
  );
}

(async function main() {
  const symbols = await getAllSymbol().then((res) => {
    if (res) {
      return res.map((v) => v.symbol);
    }
    return [];
  });

  if (!Array.isArray(symbols) || symbols.length == 0) {
    return;
  }

  const limit = pLimit(10);

  symbols.forEach((s) => {
    limit(() => updateStockLimited(s));
  });
})();
