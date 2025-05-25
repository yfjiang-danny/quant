import * as dotenv from "dotenv";
import { dbQuery } from "../db/connect";
import { StockLadderTable } from "../db/tables/ladder";
import {
  StockSnapshot15Table,
  StockSnapshot18Table,
  StockSnapshot25Table,
  StockSnapshot30Table,
  StockSnapshotTable,
} from "../db/tables/snapshot";
import { StockInfoTable } from "../db/tables/stockInfo";
import { StockFactorTable } from "../db/tables/factor";

dotenv.config();

async function main() {
  // const snapshot15Table = StockSnapshot15Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot15Table);

  // const snapshot18Table = StockSnapshot18Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot18Table);

  // const snapshot25Table = StockSnapshot25Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot25Table);

  // const snapshot30Table = StockSnapshot30Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot30Table);

  const factorTable = StockFactorTable.create().ifNotExists().toQuery();
  await dbQuery(factorTable);
}

main();
