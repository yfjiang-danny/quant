import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IDDataType,
  MaxNumericDataType,
  symbolDataType,
} from "../base";
import sql from "sql";

export type PlanExecFlag = 0 | 1;

export interface PlanTableModel extends BaseTableModel {
  account_id: string;
  plan_id: string;
  date: string;
  symbol: string;
  deal_type: number;
  plan_amount: number;
  exec_flag: PlanExecFlag;
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
      dataType: dateDataType,
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
    plan_amount: {
      name: "plan_amount",
      dataType: MaxNumericDataType,
      notNull: true,
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
      notNull: true,
    },
  },
});
