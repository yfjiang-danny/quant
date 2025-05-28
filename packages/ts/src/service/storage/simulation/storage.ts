import { IAccountTable } from "../../../db/interface/simulation/account";
import { IHoldingTable } from "../../../db/interface/simulation/holding";
import { IPlanTable } from "../../../db/interface/simulation/plan";
import { AccountTableModel } from "../../../db/tables/simulation/account";
import { HoldingTableModel } from "../../../db/tables/simulation/holding";
import {
  PlanExecFlag,
  PlanTableModel,
} from "../../../db/tables/simulation/plan";
import { tableInsert, tableQuery } from "../util";

export namespace SimulationStorage {
  export function createAccount(name: string, amount: number) {
    return tableInsert(IAccountTable.createAccount(name, amount));
  }

  export function queryAccountByName(name: string) {
    return tableQuery<AccountTableModel>(
      IAccountTable.queryAccountByName(name)
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

  export function insertHoldings(holdings: HoldingTableModel[]) {
    return tableInsert(IHoldingTable.insert(holdings));
  }

  export function queryHoldingsByAccoundID(id: string) {
    return tableQuery(IHoldingTable.queryHoldingsByAccountID(id));
  }
}
