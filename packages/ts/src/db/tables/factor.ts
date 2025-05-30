import sql from "sql";
import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  NumberFixedDataType,
  SymbolDataType,
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
      dataType: DateDataType,
      notNull: true,
      primaryKey: true,
    },
    symbol: {
      name: "symbol",
      dataType: SymbolDataType,
      notNull: true,
      primaryKey: true,
    },
    flow_capital: {
      name: "flow_capital",
      dataType: NumberFixedDataType,
    },
    sma5: {
      name: "sma5",
      dataType: NumberFixedDataType,
    },
    sma10: {
      name: "sma10",
      dataType: NumberFixedDataType,
    },
    sma20: {
      name: "sma20",
      dataType: NumberFixedDataType,
    },
    sma60: {
      name: "sma60",
      dataType: NumberFixedDataType,
    },
    sma120: {
      name: "sma120",
      dataType: NumberFixedDataType,
    },
  },
});
