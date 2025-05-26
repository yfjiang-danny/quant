import moment from "moment";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  PlanExecFlag,
  PlanTable,
  PlanTableModel,
} from "../../tables/simulation/plan";

export namespace IPlanTable {
  export function insert(plans: PlanTableModel[], shouldUpdate = false) {
    //
    const size = 500,
      len = plans.length;
    const querys: QueryLike[] = [];
    let start = 0,
      end = size;

    while (start < len && end > start) {
      querys.push(
        (
          PlanTable.insert(
            plans.slice(start, end).map((v) => ({
              ...v,
              createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
              updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
            }))
          ) as any
        )
          .onConflict({
            columns: [PlanTable.symbol.name, PlanTable.date.name],
            update: shouldUpdate
              ? PlanTable.columns
                  .filter(
                    (v) =>
                      ![
                        PlanTable.symbol?.name as string,
                        PlanTable.date?.name as string,
                        PlanTable.createAt?.name as string,
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

    return dbQuery<PlanTableModel[]>(querys);
  }

  export function updateByID(plan: PlanTableModel) {
    return dbQuery<PlanTableModel[]>(
      PlanTable.update({
        ...plan,
        updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      })
        .where(PlanTable.account_id.equals(plan.account_id))
        .where(PlanTable.plan_id.equals(plan.plan_id))
        .toQuery()
    );
  }

  export function updateExecFlagByID(id: string, flag: PlanExecFlag) {
    return dbQuery<PlanTableModel[]>(
      PlanTable.update({
        exec_flag: flag,
        updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      })
        .where(PlanTable.plan_id.equals(id))
        .toQuery()
    );
  }

  export function queryPlansByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<PlanTableModel[]>(
      PlanTable.select(PlanTable.star())
        .where(PlanTable.account_id.equals(accountID))
        .where(PlanTable.date.equals(date))
        .toQuery()
    );
  }

  export function queryBuyPlansByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<PlanTableModel[]>(
      PlanTable.select(PlanTable.star())
        .where(PlanTable.account_id.equals(accountID))
        .where(PlanTable.date.equals(date))
        .where(PlanTable.deal_type.equals(0))
        .toQuery()
    );
  }

  export function querySellPlansByAccountIDAndDate(
    accountID: string,
    date: string
  ) {
    return dbQuery<PlanTableModel[]>(
      PlanTable.select(PlanTable.star())
        .where(PlanTable.account_id.equals(accountID))
        .where(PlanTable.date.equals(date))
        .where(PlanTable.deal_type.equals(1))
        .toQuery()
    );
  }
}
