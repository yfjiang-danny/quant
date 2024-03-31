import sql from "sql";
import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  nameDataType,
  symbolDataType,
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
    name: {
      name: "name",
      dataType: nameDataType,
    },
    ladder: {
      name: "ladder",
      dataType: "smallint",
    },
  },
});
