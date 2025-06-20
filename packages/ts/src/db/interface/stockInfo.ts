import { QueryResult } from "pg";
import { QueryLike } from "sql";
import moment from "moment";
import { StockInfoTable, StockInfoTableModel } from "../tables/stockInfo";
import { dbQuery } from "../connect";

export namespace IStockInfoTable {
  export function insert(stocks: StockInfoTableModel[]) {
    //
    const size = 500,
      len = stocks.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          StockInfoTable.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              update_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [StockInfoTable.symbol?.name],
            onlyUpdateNotNull: true,
            update: StockInfoTable.columns
              .filter(
                (v) =>
                  ![
                    StockInfoTable.symbol?.name as string,
                    StockInfoTable.create_at?.name as string,
                  ].includes(v.name as unknown as string)
              )
              .map((v) => {
                return v.name;
              }),
          })
          .toQuery()
      );
      start = end;
      end = start + size;
    }

    return dbQuery<StockInfoTableModel[]>(querys);
  }

  export function update(stocks: StockInfoTableModel[]) {
    //
    const querys: QueryLike[] = [];
    let i = 0;

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        StockInfoTable.update({
          ...stock,
          update_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        })
          .where(StockInfoTable.symbol?.equals(stock.symbol))
          .toQuery()
      );
    }
    return dbQuery<StockInfoTableModel[]>(querys);
  }

  export function del(symbols: string[]) {
    //
    const query = StockInfoTable.delete()
      .where(StockInfoTable.symbol?.in(symbols))
      .toQuery();
    return dbQuery(query);
  }

  export function getAllStocks(): Promise<QueryResult<StockInfoTableModel[]>> {
    //
    const query = StockInfoTable.select(StockInfoTable.star())
      .where(StockInfoTable.is_del?.isNull())
      .toQuery();

    return dbQuery<StockInfoTableModel[]>(query);
  }

  export function getStockInfoBySymbol(
    symbol: string
  ): Promise<QueryResult<StockInfoTableModel[]>> {
    const query = StockInfoTable.select(StockInfoTable.star())
      .from(StockInfoTable)
      .where(StockInfoTable.symbol?.equals(symbol))
      .toQuery();

    return dbQuery<StockInfoTableModel[]>(query);
  }
}
