import { QueryResult } from "pg";
import { BinaryNode, QueryLike } from "sql";
import moment from "moment";
import { dbQuery } from "../connect";
import { StockFactorTable, StockFactorTableModel } from "../tables/factor";
import { StockSnapshotTableModel } from "../tables/snapshot";
import { Breakthrough20StockModel, MaxCapitalStockModel } from "./model";
import { getLatestTradeDates, toDashDate } from "../../utils/date";

export namespace IStockFactorTable {
  export function insert(stocks: StockFactorTableModel[]) {
    //
    const size = 500,
      len = stocks.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          StockFactorTable.insert(
            stocks.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [StockFactorTable.symbol.name, StockFactorTable.date.name],
            update: StockFactorTable.columns
              .filter(
                (v) =>
                  ![
                    StockFactorTable.symbol?.name as string,
                    StockFactorTable.date?.name as string,
                    StockFactorTable.createAt?.name as string,
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

    return dbQuery<StockFactorTableModel[]>(querys);
  }

  export function update(stocks: StockFactorTableModel[]) {
    //
    const querys: QueryLike[] = [];
    let i = 0;

    while (i < stocks.length) {
      const stock = stocks[i++];
      querys.push(
        StockFactorTable.update({
          ...stock,
          updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        })
          .where(StockFactorTable.symbol?.equals(stock.symbol))
          .toQuery()
      );
    }
    return dbQuery<StockFactorTableModel[]>(querys);
  }

  export function del(
    stocks: Pick<StockFactorTableModel, "symbol" | "date">[]
  ) {
    //
    let mQuery = StockFactorTable.delete();
    let node: BinaryNode | undefined = undefined;
    let i = 0;
    while (i < stocks.length) {
      const stock = stocks[i++];
      if (node) {
        node = node.or(
          StockFactorTable.symbol
            .equals(stock.symbol)
            .and(StockFactorTable.date.equals(stock.date))
        );
      } else {
        node = StockFactorTable.symbol
          .equals(stock.symbol)
          .and(StockFactorTable.date.equals(stock.date));
      }
    }
    if (node) {
      mQuery = mQuery.where(node);
    }
    const query = mQuery.toQuery();
    return dbQuery(query);
  }

  export function queryStockFactorBySymbolAndDate(
    symbol: string,
    date: string
  ): Promise<QueryResult<StockFactorTableModel[]>> {
    //
    let mQuery = StockFactorTable.select(StockFactorTable.star())
      .where(StockFactorTable.date.equals(date))
      .where(StockFactorTable.symbol.equals(symbol));

    return dbQuery<StockFactorTableModel[]>(mQuery.toQuery());
  }

  export function queryStocksByDateAndMaxCapital(
    date: string,
    maxCapital: number
  ) {
    const str = `select t.*
from (
SELECT a.symbol,a.date,a.sma5,a.sma10,a.sma20,a.sma60,a.sma120,a.flow_capital,to_number(flow_capital,translate(flow_capital,'0123456789.','9999999999D')) flow_capital_number,b.name,b.open,b.close,b.high,b.low,b.turnover,b.top_price,b.bottom_price,b.change
FROM "stock_factor" a
left join "stock_snapshots" b on a.symbol=b.symbol and a.date=b.date
where a.date = '${date}'
and a.flow_capital is not null
) t
where t.flow_capital_number < ${maxCapital}
order by t.flow_capital_number
 asc`;
    return dbQuery<MaxCapitalStockModel[]>({
      text: str,
    });
  }

  export function queryBreakthrough20StocksByDateAndMaxCapital(
    date: string,
    maxCapital: number
  ) {
    const preDate = getLatestTradeDates(2, date)[1];
    const str = `select t.*
from
(
select a.symbol,a.date,to_number(flow_capital,translate(flow_capital,'0123456789.','9999999999D')) flow_capital_number,to_number(a.sma20,translate(a.sma20,'0123456789.','9999999999D')) sma20_number, b.name,to_number(b.close,translate(b.close,'0123456789.','9999999999D')) close_number, to_number(b.turnover,translate(b.turnover,'0123456789.','9999999999D')) turnover_number,b.open,b.high,b.low
from "stock_factor" a
left join "stock_snapshots" b on a.date=b.date and a.symbol=b.symbol
where a.date='${date}'
and b.close is not null
and a.sma20 is not null
and a.flow_capital is not null
) t
where t.flow_capital_number < ${maxCapital}
and t.close_number > t.sma20_number
and t.symbol in(
select t1.symbol
from
(
select a1.symbol,a1.date,to_number(a1.sma20,translate(a1.sma20,'0123456789.','9999999999D')) sma20_number,to_number(b1.close,translate(b1.close,'0123456789.','9999999999D')) close_number
from "stock_factor" a1
left join "stock_snapshots" b1 on a1.date=b1.date and a1.symbol=b1.symbol
where a1.date='${preDate}'
and b1.close is not null
and a1.sma20 is not null
and a1.flow_capital is not null
) t1
where t1.close_number <= t1.sma20_number
)
order by t.turnover_number desc
`;

    /**

and t.symbol in
(
  select t2.symbol
from
(
select a2.symbol,a2.date,to_number(a2.sma20,translate(a2.sma20,'0123456789.','9999999999D')) a_sma20_number,to_number(b2.sma20,translate(b2.sma20,'0123456789.','9999999999D')) b_sma20_number
from "stock_factor" a2
left join "stock_factor" b2 on a2.symbol=b2.symbol
where a2.date='${date}'
and a2.sma20 is not null
and a2.flow_capital is not null
and b2.date='${preDate}'
and b2.sma20 is not null
) t2
where t2.a_sma20_number > t2.b_sma20_number
)
  
 */

    return dbQuery<Breakthrough20StockModel[]>({
      text: str,
    });
  }
}
