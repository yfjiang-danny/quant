import moment from "moment";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  EntrustmentStatus,
  EntrustmentTable,
  EntrustmentTableModel,
} from "../../tables/simulation/entrustment";

export namespace IEntrustmentTable {
  export function insert(data: EntrustmentTableModel[], shouldUpdate = false) {
    //
    const size = 500,
      len = data.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          EntrustmentTable.insert(
            data.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [
              EntrustmentTable.symbol.name,
              EntrustmentTable.account_id.name,
            ],
            update: shouldUpdate
              ? EntrustmentTable.columns
                  .filter(
                    (v) =>
                      ![
                        EntrustmentTable.symbol?.name as string,
                        EntrustmentTable.account_id?.name as string,
                        EntrustmentTable.createAt?.name as string,
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

    return dbQuery<EntrustmentTableModel[]>(querys);
  }

  export function updateByID(data: EntrustmentTableModel) {
    return dbQuery<EntrustmentTableModel[]>(
      EntrustmentTable.update({
        ...data,
        updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
        .where(EntrustmentTable.account_id.equals(data.account_id))
        .where(EntrustmentTable.id.equals(data.id))
        .toQuery()
    );
  }

  export function updateStatusByID(id: string, status: EntrustmentStatus) {
    return dbQuery<EntrustmentTableModel[]>(
      EntrustmentTable.update({
        status: status,
        updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
        .where(EntrustmentTable.id.equals(id))
        .toQuery()
    );
  }

  export function queryEntrustmentsByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<EntrustmentTableModel[]>(
      EntrustmentTable.select(EntrustmentTable.star())
        .where(EntrustmentTable.account_id.equals(accountID))
        .where(EntrustmentTable.date.equals(date))
        .toQuery()
    );
  }

  export function queryBuyEntrustmentsByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<EntrustmentTableModel[]>(
      EntrustmentTable.select(EntrustmentTable.star())
        .where(EntrustmentTable.account_id.equals(accountID))
        .where(EntrustmentTable.date.equals(date))
        .where(EntrustmentTable.deal_type.equals(0))
        .toQuery()
    );
  }

  export function querySellEntrustmentsByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<EntrustmentTableModel[]>(
      EntrustmentTable.select(EntrustmentTable.star())
        .where(EntrustmentTable.account_id.equals(accountID))
        .where(EntrustmentTable.date.equals(date))
        .where(EntrustmentTable.deal_type.equals(1))
        .toQuery()
    );
  }
}
