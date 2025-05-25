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
