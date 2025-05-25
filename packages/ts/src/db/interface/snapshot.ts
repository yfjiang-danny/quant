import { QueryResult } from "pg";
import { BinaryNode, QueryLike } from "sql";
import moment from "moment";
import {
  StockSnapshotTable,
  StockSnapshotTableModel,
} from "../tables/snapshot";
import { dbQuery } from "../connect";
import { StockInfoTable, StockInfoTableModel } from "../tables/stockInfo";

export namespace IStockSnapshotTable {
  export function insert(
    stocks: StockSnapshotTableModel[],
    shouldUpdate = false
  ) {
    //
    const size = 500,
      len = stocks.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          StockSnapshotTable.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [
              StockSnapshotTable.symbol.name,
              StockSnapshotTable.date.name,
            ],
            update: shouldUpdate
              ? StockSnapshotTable.columns
                  .filter(
                    (v) =>
                      ![
                        StockSnapshotTable.symbol?.name as string,
                        StockSnapshotTable.date?.name as string,
                        StockSnapshotTable.createAt?.name as string,
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

    return dbQuery<StockSnapshotTableModel[]>(querys);
  }

  export function update(stocks: StockSnapshotTableModel[]) {
    //
    const querys: QueryLike[] = [];
    let i = 0;

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        StockSnapshotTable.update({
          ...stock,
          updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        })
          .where(
            StockSnapshotTable.symbol
              ?.equals(stock.symbol)
              .and(StockSnapshotTable.date.equals(stock.date))
          )
          .toQuery()
      );
    }
    return dbQuery<StockSnapshotTableModel[]>(querys);
  }

  export function del(
    stocks: Pick<StockSnapshotTableModel, "symbol" | "date">[]
  ) {
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
    date: string,
    node?: BinaryNode
  ): Promise<QueryResult<StockSnapshotTableModel[]>> {
    //
    let mQuery = StockSnapshotTable.select(StockSnapshotTable.star()).where(
      StockSnapshotTable.date.equals(date)
    );

    if (node) {
      mQuery = mQuery.where(node);
    }

    const query = mQuery.order(StockSnapshotTable.symbol).toQuery();

    return dbQuery<StockSnapshotTableModel[]>(query);
  }

  export function getStocksBySymbol(
    symbol: string,
    limit?: number,
    offset?: number,
    node?: BinaryNode
  ): Promise<QueryResult<StockSnapshotTableModel[]>> {
    //
    let mQuery = StockSnapshotTable.select(StockSnapshotTable.star()).where(
      StockSnapshotTable.symbol.equals(symbol)
    );

    if (node) {
      mQuery = mQuery.where(node);
    }

    mQuery = mQuery.order(StockSnapshotTable.date.descending);

    if (typeof limit === "number") {
      if (typeof offset === "number") {
        mQuery = mQuery.offset(offset);
      }
      mQuery = mQuery.limit(limit);
    }

    return dbQuery<StockSnapshotTableModel[]>(mQuery.toQuery());
  }

  export function getStockDetailsByDate(
    date: string,
    offset?: number,
    limit?: number
  ) {
    let str = `SELECT a.*,b.*
    FROM "stock_snapshots" a
    left outer join stock_info b
    on a.symbol = b.symbol
    where a.date = '${date}'
    and a.symbol is not null
    and b.symbol is not null\n
    order by a.symbol`;
    if (typeof offset === "number" && limit) {
      str += ` offset ${offset} limit ${limit}`;
    }
    return dbQuery<(StockInfoTableModel & StockSnapshotTableModel)[]>({
      text: str,
    });
  }
}
