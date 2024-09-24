import { QueryResult } from "pg";
import { BinaryNode, QueryLike } from "sql";
import moment from "moment";
import { StockLadderTable, StockLadderTableModel } from "../tables/ladder";
import { dbQuery } from "../connect";
import { LadderColumns } from "../../models/upperlimit/constant";

export namespace IStockLadderTable {
  export function insert(stocks: StockLadderTableModel[]) {
    //
    const size = 500,
      len = stocks.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          StockLadderTable.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [StockLadderTable.symbol.name, StockLadderTable.date.name],
            update: StockLadderTable.columns
              .filter(
                (v) =>
                  ![
                    StockLadderTable.symbol?.name as string,
                    StockLadderTable.date?.name as string,
                    StockLadderTable.createAt?.name as string,
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

    return dbQuery<StockLadderTableModel[]>(querys);
  }

  export function update(stocks: StockLadderTableModel[]) {
    //
    const querys: QueryLike[] = [];
    let i = 0;

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        StockLadderTable.update({
          ...stock,
          updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        })
          .where(StockLadderTable.symbol?.equals(stock.symbol))
          .toQuery()
      );
    }
    return dbQuery<StockLadderTableModel[]>(querys);
  }

  export function del(
    stocks: Pick<StockLadderTableModel, "symbol" | "date">[]
  ) {
    //
    let mQuery = StockLadderTable.delete();
    let node: BinaryNode | undefined = undefined;
    let i = 0;
    while (i < stocks.length) {
      const stock = stocks[i++];
      if (node) {
        node = node.or(
          StockLadderTable.symbol
            .equals(stock.symbol)
            .and(StockLadderTable.date.equals(stock.date))
        );
      } else {
        node = StockLadderTable.symbol
          .equals(stock.symbol)
          .and(StockLadderTable.date.equals(stock.date));
      }
    }
    if (node) {
      mQuery = mQuery.where(node);
    }
    const query = mQuery.toQuery();
    return dbQuery(query);
  }

  export function getStockLadderByDate(
    date: string,
    ladder?: number
  ): Promise<QueryResult<StockLadderTableModel[]>> {
    //
    let mQuery = StockLadderTable.select(StockLadderTable.star()).where(
      StockLadderTable.date.equals(date)
    );

    if (ladder) {
      mQuery = mQuery.where(StockLadderTable.ladder.equals(ladder));
    }

    return dbQuery<StockLadderTableModel[]>(
      mQuery.order(StockLadderTable.ladder).toQuery()
    );
  }

  export function getStockLadderSymbolByDates(dates: string[]) {
    //
    let mQuery = StockLadderTable.select(StockLadderTable.symbol)
      .where(
        StockLadderTable.date.in(dates).and(StockLadderTable.symbol.isNotNull())
      )
      .group(StockLadderTable.symbol);

    const query = mQuery.order(StockLadderTable.symbol).toQuery();

    return dbQuery<Pick<StockLadderTableModel, "symbol">[]>(query);
  }
}
