import { QueryResult } from "pg";
import { BinaryNode, QueryLike } from "sql";
import moment from "moment";
import {
  StockSnapshot15Table,
  StockSnapshot18Table,
  StockSnapshot25Table,
  StockSnapshot30Table,
  StockSnapshotTable,
  StockSnapshotTableModel,
  StockTimeSnapshotTableModel,
} from "../tables/snapshot";
import { dbQuery } from "../connect";
import { StockInfoTableModel } from "../tables/stockInfo";
import sql, { ColumnDefinition, TableDefinition } from "sql";

export namespace IStockTimeSnapshotTable {
  export type TableType = 15 | 18 | 25 | 30;
  export function getTable(t: TableType) {
    switch (t) {
      case 15:
        return StockSnapshot15Table;
      case 18:
        return StockSnapshot18Table;
      case 25:
        return StockSnapshot25Table;
      case 30:
        return StockSnapshot30Table;
      default:
        return StockSnapshot15Table;
    }
  }

  export function insert(
    tableType: TableType,
    stocks: StockTimeSnapshotTableModel[],
    shouldUpdate = false
  ) {
    const size = 500,
      len = stocks.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    const table = getTable(tableType);

    while (start < len && end > start) {
      querys.push(
        (
          table.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [table.symbol.name, table.date.name],
            update: shouldUpdate
              ? table.columns
                  .filter(
                    (v) =>
                      ![
                        table.symbol?.name as string,
                        table.date?.name as string,
                        table.createAt?.name as string,
                      ].includes(v.name as unknown as string)
                  )
                  .map((v) => {
                    return v.name;
                  })
              : undefined,
          })
          .toQuery()
      );
      start = end;
      end = start + size;
    }

    return dbQuery<StockTimeSnapshotTableModel[]>(querys);
  }

  export function update(
    tableType: TableType,
    stocks: StockTimeSnapshotTableModel[]
  ) {
    //
    const querys: QueryLike[] = [];
    let i = 0;
    const table = getTable(tableType);

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        table
          .update({
            ...stock,
            updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
          })
          .where(
            table.symbol
              ?.equals(stock.symbol)
              .and(table.date.equals(stock.date))
          )
          .toQuery()
      );
    }
    return dbQuery<StockTimeSnapshotTableModel[]>(querys);
  }

  export function del(
    tableType: TableType,
    stocks: Pick<StockTimeSnapshotTableModel, "symbol" | "date">[]
  ) {
    const table = getTable(tableType);
    //
    let mQuery = StockSnapshotTable.delete();
    let node: BinaryNode | undefined = undefined;
    let i = 0;
    while (i < stocks.length) {
      const stock = stocks[i++];
      if (node) {
        node = node.or(
          StockSnapshotTable.symbol
            .equals(stock.symbol)
            .and(StockSnapshotTable.date.equals(stock.date))
        );
      } else {
        node = StockSnapshotTable.symbol
          .equals(stock.symbol)
          .and(StockSnapshotTable.date.equals(stock.date));
      }
    }
    if (node) {
      mQuery = mQuery.where(node);
    }
    const query = mQuery.toQuery();
    return dbQuery(query);
  }

  export function getStocksByDate(
    tableType: TableType,
    date: string,
    node: BinaryNode | undefined = undefined
  ): Promise<QueryResult<StockTimeSnapshotTableModel[]>> {
    const table = getTable(tableType);
    //
    let mQuery = table.select(table.star()).where(table.date.equals(date));

    if (node) {
      mQuery = mQuery.where(node);
    }

    const query = mQuery.order(table.symbol).toQuery();

    return dbQuery<StockTimeSnapshotTableModel[]>(query);
  }

  export function getStocksBySymbol(
    tableType: TableType,
    symbol: string,
    limit?: number,
    offset?: number
  ): Promise<QueryResult<StockTimeSnapshotTableModel[]>> {
    const table = getTable(tableType);
    //
    let mQuery = table
      .select(table.star())
      .where(table.symbol.equals(symbol))
      .order(table.date.descending);

    if (typeof limit === "number") {
      if (typeof offset === "number") {
        mQuery = mQuery.offset(offset);
      }
      mQuery = mQuery.limit(limit);
    }

    return dbQuery<StockTimeSnapshotTableModel[]>(mQuery.toQuery());
  }

  export function getStockDetailsByDate(
    tableType: TableType,
    date: string,
    offset?: number,
    limit?: number
  ) {
    const table = getTable(tableType);
    const tableName = table.getName();
    let str = `SELECT a.*,b.*
    FROM "${tableName}" a
    left outer join stock_info b
    on a.symbol = b.symbol
    where a.date = '${date}'
    and a.symbol is not null
    and b.symbol is not null\n
    order by a.symbol`;
    if (typeof offset === "number" && limit) {
      str += ` offset ${offset} limit ${limit}`;
    }
    return dbQuery<(StockInfoTableModel & StockTimeSnapshotTableModel)[]>({
      text: str,
    });
  }
}
