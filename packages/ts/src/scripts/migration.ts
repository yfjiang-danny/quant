import * as dotenv from "dotenv";
import {
  StockInfoTable,
  StockLadderTable,
  StockHistoriesTable,
} from "../db/tables";
import { dbQuery } from "../db";

dotenv.config();

async function main() {
  const basicStockTable = StockInfoTable.create().ifNotExists().toQuery();
  await dbQuery(basicStockTable);

  const historyTable = StockHistoriesTable.create().ifNotExists().toQuery();
  await dbQuery(historyTable);
  // const historyTableIndexQuery = StockHistoriesTable.indexes()
  //   .create()
  //   .on(
  //     { name: StockHistoriesTable.date },
  //     { name: StockHistoriesTable.symbol }
  //   )
  //   .toQuery();
  // await dbQuery(historyTableIndexQuery);

  const ladderTable = StockLadderTable.create().ifNotExists().toQuery();
  await dbQuery(ladderTable);
  // const ladderTableIndexQuery = LadderTable.indexes()
  //   .create()
  //   .on({ name: LadderTable.date }, { name: LadderTable.symbol })
  //   .toQuery();
  // await dbQuery(ladderTableIndexQuery);
}

main();
