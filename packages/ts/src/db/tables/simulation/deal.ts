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

export interface DealTableModel extends BaseTableModel {
  account_id: string;
  deal_id: string;
  deal_date: string;
  deal_type: number; // 0 - buy, 1 - sell
  symbol: string;
  count: number;
  price: number;
  amount: number;
  fee: number;
}

export const DealTable = sql.define<string, DealTableModel>({
  name: "deal",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
      notNull: true,
      references: {
        table: "account",
        column: "account_id",
      },
    },
    deal_id: {
      name: "deal_id",
      dataType: IDDataType,
      notNull: true,
      primaryKey: true,
    },
    deal_date: {
      name: "deal_date",
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
    fee: {
      name: "fee",
      dataType: SmallNumericDataType,
    },
  },
});
