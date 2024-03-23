import * as dotenv from "dotenv";
import { BasicStockTable, LadderTable } from "../db/tables";
import { dbQuery } from "../db";

dotenv.config();

async function main() {
  const qy = LadderTable.create().toQuery();

  console.log(qy);

  const res = await dbQuery(`${qy.text} WITH OIDS`, qy.values);

  console.log(res);
}

main();
