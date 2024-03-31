import * as dotenv from "dotenv";
import { dbQuery } from "../../models/con";
import { StockLadderTable } from "../../models/tables/ladder";
import { StockSnapshotTable } from "../../models/tables/snapshot";
import { StockInfoTable } from "../../models/tables/stockInfo";

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
