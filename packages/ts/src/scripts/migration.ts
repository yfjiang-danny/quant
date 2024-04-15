import * as dotenv from "dotenv";
import { dbQuery } from "../db/con";
import { StockLadderTable } from "../db/tables/ladder";
import { StockSnapshotTable } from "../db/tables/snapshot";
import { StockInfoTable } from "../db/tables/stockInfo";

dotenv.config();

async function main() {
  const basicStockTable = StockInfoTable.create().ifNotExists().toQuery();
  await dbQuery(basicStockTable);

  const snapshotTable = StockSnapshotTable.create().ifNotExists().toQuery();
  await dbQuery(snapshotTable);

  const ladderTable = StockLadderTable.create().ifNotExists().toQuery();
  await dbQuery(ladderTable);
}

main();
