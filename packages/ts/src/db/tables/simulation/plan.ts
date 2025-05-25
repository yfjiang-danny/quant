import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IDDataType,
  MaxNumericDataType,
  symbolDataType,
} from "../base";
import sql from "sql";

export interface PlanTableModel extends BaseTableModel {
  account_id: string;
  plan_id: string;
  date: string;
  symbol: string;
  deal_type: number;
  plan_amount?: number;
}

export const PlanTable = sql.define<string, PlanTableModel>({
  name: "plan",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
    },
    plan_id: {
      name: "plan_id",
      dataType: IDDataType,
    },
    date: {
      name: "date",
      dataType: dateDataType,
    },
    deal_type: {
      name: "deal_type",
      dataType: "smallint",
    },
    plan_amount: {
      name: "plan_amount",
      dataType: MaxNumericDataType,
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
    },
  },
});
