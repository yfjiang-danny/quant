import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  IDDataType,
  NameDataType,
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
      dataType: NameDataType,
      notNull: true,
    },
    date: {
      name: "date",
      dataType: DateDataType,
      notNull: true,
    },
    content: {
      name: "content",
      dataType: "text",
    },
  },
});
