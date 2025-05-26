import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IDDataType,
  nameDataType,
} from "../base";
import sql from "sql";

export interface StrategyTableModel extends BaseTableModel {
  id: string;
  name: string;
  date: string;
  content?: string;
}

export const StrategyTable = sql.define<string, StrategyTableModel>({
  name: "strategy",
  schema: "",
  columns: {
    ...baseColumns,
    id: {
      name: "id",
      dataType: IDDataType,
      notNull: true,
    },
    name: {
      name: "name",
      dataType: nameDataType,
      notNull: true,
      unique: true,
    },
    date: {
      name: "date",
      dataType: dateDataType,
      notNull: true,
    },
    content: {
      name: "content",
      dataType: "text",
    },
  },
});
