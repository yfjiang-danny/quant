import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  IDDataType,
  MaxNumericDataType,
  NameDataType,
  SmallNumericDataType,
} from "../base";
import sql from "sql";

export interface AccountTableModel extends BaseTableModel {
  account_id: string;
  name: string;
  amount: number;
  holding: number;
  available: number;
  interest: number;
  interest_rate: number;
  init_amount: number;
  date: string;
  time: string;
}

export const AccountTable = sql.define<string, AccountTableModel>({
  name: "account",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
      notNull: true,
      primaryKey: true,
    },
    date: {
      name: "date",
      dataType: DateDataType,
    },
    time: {
      name: "time",
      dataType: DateDataType,
    },
    name: {
      name: "name",
      dataType: NameDataType,
      notNull: true,
      unique: true,
    },
    amount: {
      name: "amount",
      dataType: MaxNumericDataType,
    },
    available: {
      name: "available",
      dataType: MaxNumericDataType,
    },
    holding: {
      name: "holding",
      dataType: MaxNumericDataType,
    },
    init_amount: {
      name: "init_amount",
      dataType: MaxNumericDataType,
    },
    interest: {
      name: "interest",
      dataType: MaxNumericDataType,
    },
    interest_rate: {
      name: "interest_rate",
      dataType: SmallNumericDataType,
    },
  },
});
