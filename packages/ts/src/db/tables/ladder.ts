import sql from "sql";
import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  NameDataType,
  SymbolDataType,
} from "./base";

export interface StockLadderTableModel extends BaseTableModel {
  date: string;
  symbol: string;
  name: string;
  ladder: number;
}

export const StockLadderTable = sql.define<string, StockLadderTableModel>({
  name: "stock_ladder",
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
    name: {
      name: "name",
      dataType: NameDataType,
    },
    ladder: {
      name: "ladder",
      dataType: "smallint",
    },
  },
});
