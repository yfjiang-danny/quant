import * as dotenv from "dotenv";
import { QueryLike } from "sql";
import { dbQuery } from "../db/connect";
import { StockSnapshot30Table } from "../db/tables/snapshot";
import { StockInfoTable, StockInfoTableModel } from "../db/tables/stockInfo";

dotenv.config();

(async function main() {
  const query = StockSnapshot30Table.select(StockSnapshot30Table.symbol)
    .where(
      StockSnapshot30Table.time
        .equals("08:00:00")
        .and(StockSnapshot30Table.date.equals("20250110"))
    )
    .toQuery();
  const symbols = await dbQuery<Partial<StockInfoTableModel>[]>(query).then(
    (res) => {
      return res.rows as Partial<StockInfoTableModel>[];
    }
  );

  //
  const size = 20,
    len = symbols.length;
  const updateQuerys: QueryLike[] = [];
  let start = 0,
    end = size;

  while (start < len && end > start) {
    updateQuerys.push(
      StockInfoTable.where(
        StockInfoTable.symbol?.in(
          symbols
            .slice(start, end)
            .map((v) => v.symbol)
            .filter((v) => !!v) as string[]
        )
      )
        .update({ is_del: 1 })
        .toQuery()
    );
    start = end;
    end = start + size;
  }

  const res = await dbQuery(updateQuerys);

  console.log(res);
})();
