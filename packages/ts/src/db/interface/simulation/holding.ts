import moment from "moment";
import { QueryResult } from "pg";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  HoldingTable,
  HoldingTableModel,
} from "../../tables/simulation/holding";
import { TableTotalCountModel } from "../type";

export namespace IHoldingTable {
  export function insert(holdings: HoldingTableModel[], shouldUpdate = false) {
    //
    const size = 500,
      len = holdings.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          HoldingTable.insert(
            holdings.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [HoldingTable.symbol.name, HoldingTable.account_id.name],
            onlyUpdateNotNull: true,
            update: shouldUpdate
              ? HoldingTable.columns
                  .filter(
                    (v) =>
                      ![
                        HoldingTable.symbol?.name as string,
                        HoldingTable.account_id?.name as string,
                        HoldingTable.createAt?.name as string,
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

    return dbQuery<HoldingTableModel[]>(querys);
  }

  export function updateHolding(holding: HoldingTableModel) {
    return dbQuery<HoldingTableModel[]>(
      HoldingTable.update({
        ...holding,
        updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
        .where(HoldingTable.account_id.equals(holding.account_id))
        .where(HoldingTable.symbol.equals(holding.symbol))
        .toQuery()
    );
  }

  export function updateHoldings(holdings: HoldingTableModel[]) {
    //
    const size = 500,
      len = holdings.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    const promises: Promise<QueryResult<HoldingTableModel[]>>[] = [];
    while (start < len && end > start) {
      querys.push(
        ...holdings.slice(start, end).map((v) => {
          return HoldingTable.update({
            ...v,
            updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          }).toQuery();
        })
      );
      promises.push(dbQuery<HoldingTableModel[]>(querys));
      start = end;
      end = start + size;
    }

    return new Promise<QueryResult<HoldingTableModel[]>>((resolve, reject) => {
      Promise.allSettled(promises).then(
        (res) => {
          const result = res.reduce(
            (r, c) => {
              if (c.status === "fulfilled") {
                r.command = c.value.command;
                c.value.rowCount &&
                  ((r.rowCount as number) += c.value.rowCount);
                Array.isArray(c.value.rows) && r.rows.push(...c.value.rows);
              }

              return r;
            },
            { rowCount: 0, rows: [] } as unknown as QueryResult<
              HoldingTableModel[]
            >
          );

          resolve(result);
        },
        (e) => {
          reject(e);
        }
      );
    });
  }

  export function queryHoldingCountByAccountID(accountID: string) {
    const str = `SELECT count(*)
    FROM "holding"
    where account_id = '${accountID}'`;
    return dbQuery<TableTotalCountModel[]>({ text: str });
  }

  export function queryHoldingsByAccountID(accountID: string) {
    return dbQuery<HoldingTableModel[]>(
      HoldingTable.select(HoldingTable.star())
        .where(HoldingTable.account_id.equals(accountID))
        .toQuery()
    );
  }

  export function queryHoldingsByAccountIDAndSymbol(
    accountID: string,
    symbol: string
  ) {
    return dbQuery<HoldingTableModel[]>(
      HoldingTable.select(HoldingTable.star())
        .where(HoldingTable.account_id.equals(accountID))
        .where(HoldingTable.symbol.equals(symbol))
        .toQuery()
    );
  }

  export function queryAccountHoldingsBySymbols(
    accountID: string,
    symbols: string[]
  ) {
    let querys = HoldingTable.select(HoldingTable.star()).where(
      HoldingTable.account_id.equals(accountID)
    );

    if (symbols.length > 0) {
      querys = querys.where(HoldingTable.symbol.in(symbols));
    }

    return dbQuery<HoldingTableModel[]>(querys.toQuery());
  }
}
