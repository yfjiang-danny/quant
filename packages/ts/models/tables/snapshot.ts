import sql from "sql";
import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  nameDataType,
  numberFixedDataType,
  symbolDataType,
} from "./base";

export interface StockSnapshotTableModel extends BaseTableModel {
  date: string;
  symbol: string;
  name: string;
  close: string | null | undefined;
  open: string | null | undefined;
  high: string | null | undefined;
  low: string | null | undefined;
  volume: string | null | undefined;
  turnover: string | null | undefined;
  avg: string | null | undefined;
  change: string | null | undefined;
  top_price: string | null | undefined;
  bottom_price: string | null | undefined;
  internal: string | null | undefined;
  external: string | null | undefined;
  buy1: string | null | undefined;
  buy2: string | null | undefined;
  sale1: string | null | undefined;
  sale2: string | null | undefined;
}

export const StockSnapshotTable = sql.define<string, StockSnapshotTableModel>({
  name: "stock_snapshots",
  schema: "",
  columns: {
    ...baseColumns,
    date: {
      dataType: dateDataType,
      notNull: true,
      primaryKey: true,
    },
    symbol: {
      dataType: symbolDataType,
      notNull: true,
      primaryKey: true,
    },
    name: {
      dataType: nameDataType,
    },
    open: {
      dataType: numberFixedDataType,
    },
    close: {
      dataType: numberFixedDataType,
    },
    avg: {
      dataType: numberFixedDataType,
    },
    high: {
      dataType: numberFixedDataType,
    },
    low: {
      dataType: numberFixedDataType,
    },
    top_price: {
      dataType: numberFixedDataType,
    },
    bottom_price: {
      dataType: numberFixedDataType,
    },
    change: {
      dataType: numberFixedDataType,
    },
    turnover: {
      dataType: numberFixedDataType,
    },
    volume: {
      dataType: numberFixedDataType,
    },
    internal: {
      dataType: numberFixedDataType,
    },
    external: {
      dataType: numberFixedDataType,
    },
    buy1: {
      dataType: numberFixedDataType,
    },
    buy2: {
      dataType: numberFixedDataType,
    },
    sale1: {
      dataType: numberFixedDataType,
    },
    sale2: {
      dataType: numberFixedDataType,
    },
  },
});
