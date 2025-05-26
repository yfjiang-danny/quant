import moment from "moment";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  AccountTable,
  AccountTableModel,
} from "../../tables/simulation/account";
import { DealTable, DealTableModel } from "../../tables/simulation/deal";
const { v4: uuidv4 } = require("uuid");

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
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
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
