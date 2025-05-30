import { dbQuery } from "../../../db/connect";
import { IAccountTable } from "../../../db/interface/simulation/account";
import { IEntrustmentTable } from "../../../db/interface/simulation/entrustment";
import { IHoldingTable } from "../../../db/interface/simulation/holding";
import { IPlanTable } from "../../../db/interface/simulation/plan";
import { IStrategyTable } from "../../../db/interface/strategy/strategy";
import { AccountTableModel } from "../../../db/tables/simulation/account";
import { DealTableModel } from "../../../db/tables/simulation/deal";
import {
  EntrustmentStatus,
  EntrustmentTableModel,
} from "../../../db/tables/simulation/entrustment";
import { HoldingTableModel } from "../../../db/tables/simulation/holding";
import {
  PlanExecFlag,
  PlanTableModel,
} from "../../../db/tables/simulation/plan";
import { StrategyTableModel } from "../../../db/tables/strategy/strategy";
import { tableCount, tableInsert, tableQuery } from "../util";

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

  export function queryHoldingCountByAccountID(accountID: string) {
    return tableCount(IHoldingTable.queryHoldingCountByAccountID(accountID));
  }

  export function queryHoldingsByAccoundID(id: string) {
    return tableQuery<HoldingTableModel>(
      IHoldingTable.queryHoldingsByAccountID(id)
    );
  }

  export function queryAccountHoldingsBySymbols(
    accountID: string,
    symbols: string[]
  ) {
    return tableQuery<HoldingTableModel>(
      IHoldingTable.queryAccountHoldingsBySymbols(accountID, symbols)
    );
  }

  export function insertEntrustments(data: EntrustmentTableModel[]) {
    return tableQuery<EntrustmentTableModel>(IEntrustmentTable.insert(data));
  }

  export function queryBuyEntrustmentsByAccountIDAndDate(
    account: string,
    date: string
  ) {
    return tableQuery<EntrustmentTableModel>(
      IEntrustmentTable.queryBuyEntrustmentsByAccountIDAndDate(account, date)
    );
  }

  export function querySellEntrustmentsByAccountIDAndDate(
    account: string,
    date: string
  ) {
    return tableQuery<EntrustmentTableModel>(
      IEntrustmentTable.querySellEntrustmentsByAccountIDAndDate(account, date)
    );
  }

  export function updateEntrustmentStatusByID(
    id: string,
    status: EntrustmentStatus
  ) {
    return tableQuery<EntrustmentTableModel>(
      IEntrustmentTable.updateStatusByID(id, status)
    );
  }

  export function queryAccountHoldingDetailsBySymbols(
    accountID: string,
    symbols: string[]
  ) {
    let str = `SELECT *
    FROM "holding" a
    left join "deal" b 
    on a.account_id = b.account_id
    and a.symbol = b.symbol
    and a.buy_date = b.deal_date
    where a.account = '${accountID}'`;

    if (symbols.length > 0) {
      str += ` and a.symbol in (${symbols.join(",")})`;
    }

    return tableQuery<HoldingTableModel & DealTableModel>(
      dbQuery<(HoldingTableModel & DealTableModel)[]>({ text: str })
    );
  }

  export function queryStrategyByNameAndDate(name: string, date: string) {
    return tableQuery<StrategyTableModel>(
      IStrategyTable.queryByNameAndDate(name, date)
    );
  }
}
