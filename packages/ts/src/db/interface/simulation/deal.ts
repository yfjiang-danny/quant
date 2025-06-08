import moment from "moment";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  AccountTable,
  AccountTableModel,
} from "../../tables/simulation/account";
import { DealTable, DealTableModel } from "../../tables/simulation/deal";

export namespace IDealTable {
  export function insert(deals: DealTableModel[]) {
    //
    const size = 500,
      len = deals.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          DealTable.insert(
            deals.slice(start, end).map((v) => ({
              ...v,
              create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              update_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            }))
          ) as any
        ).toQuery()
      );
      start = end;
      end = start + size;
    }

    return dbQuery<DealTableModel[]>(querys);
  }

  export function queryDealsByAccountID(id: string) {
    return dbQuery<DealTableModel[]>(
      DealTable.select(DealTable.star())
        .where(DealTable.account_id.equals(id))
        .toQuery()
    );
  }
}
