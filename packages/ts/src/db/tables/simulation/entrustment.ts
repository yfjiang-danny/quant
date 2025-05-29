import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IDDataType,
  MaxNumericDataType,
  SmallNumericDataType,
  symbolDataType,
} from "../base";
import sql from "sql";

/**
 * 0 - 已报，1 - 已成， 2 - 未成， 3 - 未知
 */
export type EntrustmentStatus = 0 | 1 | 2 | 3;
export interface EntrustmentTableModel extends BaseTableModel {
  account_id: string;
  id: string;
  date: string;
  time: string;
  deal_type: number; // 0 - buy, 1 - sell
  symbol: string;
  count: number;
  price: number;
  amount: number;
  status: EntrustmentStatus;
}

/**
 * 委托表
 */
export const EntrustmentTable = sql.define<string, EntrustmentTableModel>({
  name: "entrustment",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
      notNull: true,
    },
    id: {
      name: "id",
      dataType: IDDataType,
      primaryKey: true,
      notNull: true,
    },
    date: {
      name: "date",
      dataType: dateDataType,
    },
    time: {
      name: "time",
      dataType: dateDataType,
    },
    deal_type: {
      name: "deal_type",
      dataType: "smallint",
    },
    status: {
      name: "status",
      dataType: "smallint",
      defaultValue: 0,
    },
    amount: {
      name: "amount",
      dataType: MaxNumericDataType,
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
    },
    count: {
      name: "count",
      dataType: MaxNumericDataType,
    },
    price: {
      name: "price",
      dataType: SmallNumericDataType,
    },
  },
});
