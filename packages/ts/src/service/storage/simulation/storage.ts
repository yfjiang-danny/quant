import { IAccountTable } from "../../../db/interface/simulation/account";
import { IPlanTable } from "../../../db/interface/simulation/plan";
import { AccountTableModel } from "../../../db/tables/simulation/account";
import {
  PlanExecFlag,
  PlanTableModel,
} from "../../../db/tables/simulation/plan";
import { tableQuery } from "../util";

export namespace SimulationStorage {
  export function createAccount(name: string, amount: number) {
    return tableQuery<AccountTableModel>(
      IAccountTable.createAccount(name, amount)
    );
  }

  export function insertPlans(plans: PlanTableModel[]) {
    return tableQuery<PlanTableModel>(IPlanTable.insert(plans));
  }

  export function queryBuyPlansByAccountIDAndDate(
    account: string,
    date: string
  ) {
    return tableQuery<PlanTableModel>(
      IPlanTable.queryBuyPlansByAccountIDAndDate(account, date)
    );
  }

  export function querySellPlansByAccountIDAndDate(
    account: string,
    date: string
  ) {
    return tableQuery<PlanTableModel>(
      IPlanTable.querySellPlansByAccountIDAndDate(account, date)
    );
  }

  export function updatePlanExecFlagByID(id: string, flag: PlanExecFlag) {
    return tableQuery<PlanTableModel>(IPlanTable.updateExecFlagByID(id, flag));
  }
}
