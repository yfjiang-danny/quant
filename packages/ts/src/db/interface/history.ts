import { QueryResult } from "pg";
import { dbQuery } from "..";
import { StockHistoryTableModel } from "../model";
import { StockHistoriesTable } from "../tables";
import { BinaryNode, QueryLike } from "sql";
import moment from "moment";

export namespace IStockHistoryTable {
  export function insert(
    stocks: StockHistoryTableModel[],
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
          StockHistoriesTable.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [
              StockHistoriesTable.symbol.name,
              StockHistoriesTable.date.name,
            ],
            update: shouldUpdate
              ? StockHistoriesTable.columns
                  .filter(
                    (v) =>
                      ![
                        StockHistoriesTable.symbol?.name as string,
                        StockHistoriesTable.date?.name as string,
                        StockHistoriesTable.createAt?.name as string,
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

    return dbQuery<StockHistoryTableModel[]>(querys);
  }

  export function update(stocks: StockHistoryTableModel[]) {
    //
    const querys: QueryLike[] = [];
    let i = 0;

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        StockHistoriesTable.update({
          ...stock,
          updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        })
          .where(
            StockHistoriesTable.symbol
              ?.equals(stock.symbol)
              .and(StockHistoriesTable.date.equals(stock.date))
          )
          .toQuery()
      );
    }
    return dbQuery<StockHistoryTableModel[]>(querys);
  }

  export function del(
    stocks: Pick<StockHistoryTableModel, "symbol" | "date">[]
  ) {
    //
    let mQuery = StockHistoriesTable.delete();
    let node: BinaryNode | undefined = undefined;
    let i = 0;
    while (i < stocks.length) {
      const stock = stocks[i++];
      if (node) {
        node = node.or(
          StockHistoriesTable.symbol
            .equals(stock.symbol)
            .and(StockHistoriesTable.date.equals(stock.date))
        );
      } else {
        node = StockHistoriesTable.symbol
          .equals(stock.symbol)
          .and(StockHistoriesTable.date.equals(stock.date));
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
  ): Promise<QueryResult<StockHistoryTableModel[]>> {
    //
    let mQuery = StockHistoriesTable.select(StockHistoriesTable.star()).where(
      StockHistoriesTable.date.equals(date)
    );

    if (node) {
      mQuery = mQuery.where(node);
    }

    const query = mQuery.order(StockHistoriesTable.symbol).limit(100).toQuery();

    return dbQuery<StockHistoryTableModel[]>(query);
  }

  export function getStocksBySymbol(
    symbol: string,
    node?: BinaryNode
  ): Promise<QueryResult<StockHistoryTableModel[]>> {
    //
    let mQuery = StockHistoriesTable.select(StockHistoriesTable.star()).where(
      StockHistoriesTable.symbol.equals(symbol)
    );

    if (node) {
      mQuery = mQuery.where(node);
    }

    return dbQuery<StockHistoryTableModel[]>(
      mQuery.order(StockHistoriesTable.date).toQuery()
    );
  }
}
