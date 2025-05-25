import * as dotenv from "dotenv";
import { dbQuery } from "../db/connect";
import { StockLadderTable } from "../db/tables/ladder";
import {
  StockSnapshot15Table,
  StockSnapshot20Table,
  StockSnapshot25Table,
  StockSnapshot30Table,
  StockSnapshotTable,
} from "../db/tables/snapshot";
import { StockInfoTable } from "../db/tables/stockInfo";
import { StockFactorTable } from "../db/tables/factor";
import { AccountTable } from "../db/tables/simulation/account";
import { DealTable } from "../db/tables/simulation/deal";
import { EntrustmentTable } from "../db/tables/simulation/entrustment";
import {
  HoldingHistoryTable,
  HoldingTable,
} from "../db/tables/simulation/holding";
import { PlanTable } from "../db/tables/simulation/plan";

dotenv.config();

async function main() {
  // const snapshot15Table = StockSnapshot15Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot15Table);

  // const snapshot20Table = StockSnapshot20Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot20Table);

  // const snapshot25Table = StockSnapshot25Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot25Table);

  // const snapshot30Table = StockSnapshot30Table.create().ifNotExists().toQuery();
  // await dbQuery(snapshot30Table);

  // const factorTable = StockFactorTable.create().ifNotExists().toQuery();
  // await dbQuery(factorTable);

  // const factorTable = AccountTable.create().ifNotExists().toQuery();
  await dbQuery(AccountTable.create().ifNotExists().toQuery());
  await dbQuery(DealTable.create().ifNotExists().toQuery());
  await dbQuery(EntrustmentTable.create().ifNotExists().toQuery());
  await dbQuery(HoldingTable.create().ifNotExists().toQuery());
  await dbQuery(HoldingHistoryTable.create().ifNotExists().toQuery());
  await dbQuery(PlanTable.create().ifNotExists().toQuery());
}

main();
