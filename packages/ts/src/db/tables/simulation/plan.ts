import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  IDDataType,
  MaxNumericDataType,
  SymbolDataType,
} from "../base";
import sql from "sql";

export type PlanExecFlag = 0 | 1;

export interface PlanTableModel extends BaseTableModel {
  account_id: string;
  plan_id: string;
  date: string;
  symbol: string;
  deal_type: number;
  plan_amount?: number;
  plan_count?: number;
  exec_flag: PlanExecFlag;
  mark?: string;
}

export const PlanTable = sql.define<string, PlanTableModel>({
  name: "plan",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
      notNull: true,
    },
    plan_id: {
      name: "plan_id",
      dataType: IDDataType,
      notNull: true,
      unique: true,
    },
    date: {
      name: "date",
      dataType: DateDataType,
      notNull: true,
    },
    deal_type: {
      name: "deal_type",
      dataType: "smallint",
      notNull: true,
    },
    exec_flag: {
      name: "exec_flag",
      dataType: "smallint",
      notNull: true,
      defaultValue: 0,
    },
    mark: {
      name: "mark",
      dataType: "text",
    },
    plan_amount: {
      name: "plan_amount",
      dataType: MaxNumericDataType,
    },
    plan_count: {
      name: "plan_count",
      dataType: "integer",
    },
    symbol: {
      name: "symbol",
      dataType: SymbolDataType,
      notNull: true,
    },
  },
});
