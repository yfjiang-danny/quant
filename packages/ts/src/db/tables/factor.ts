import sql from "sql";
import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  numberFixedDataType,
  symbolDataType,
} from "./base";

export interface StockFactorTableModel extends BaseTableModel {
  date: string;
  symbol: string;
  flow_capital: string;
  sma5: string;
  sma10: string;
  sma20: string;
  sma60: string;
  sma120: string;
}

export const StockFactorTable = sql.define<string, StockFactorTableModel>({
  name: "stock_factor",
  schema: "",
  columns: {
    ...baseColumns,
    date: {
      name: "date",
      dataType: dateDataType,
      notNull: true,
      primaryKey: true,
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
      notNull: true,
      primaryKey: true,
    },
    flow_capital: {
      name: "flow_capital",
      dataType: numberFixedDataType,
    },
    sma5: {
      name: "sma5",
      dataType: numberFixedDataType,
    },
    sma10: {
      name: "sma10",
      dataType: numberFixedDataType,
    },
    sma20: {
      name: "sma20",
      dataType: numberFixedDataType,
    },
    sma60: {
      name: "sma60",
      dataType: numberFixedDataType,
    },
    sma120: {
      name: "sma120",
      dataType: numberFixedDataType,
    },
  },
});
