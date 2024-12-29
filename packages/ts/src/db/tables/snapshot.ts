import sql, { ColumnDefinition, TableDefinition } from "sql";
import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IntegerDataType,
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
  buy1_count: number | null | undefined;
  buy2_count: number | null | undefined;
  sale1_count: number | null | undefined;
  sale2_count: number | null | undefined;
}

const StockSnapshotTableColumn: {
  [CName in keyof StockSnapshotTableModel]: ColumnDefinition<
    CName,
    StockSnapshotTableModel[CName]
  >;
} = {
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
  buy1_count: {
    dataType: IntegerDataType,
  },
  buy2_count: {
    dataType: IntegerDataType,
  },
  sale1_count: {
    dataType: IntegerDataType,
  },
  sale2_count: {
    dataType: IntegerDataType,
  },
};

export const StockSnapshotTable = sql.define<string, StockSnapshotTableModel>({
  name: "stock_snapshots",
  schema: "",
  columns: StockSnapshotTableColumn,
});

export interface StockTimeSnapshotTableModel extends StockSnapshotTableModel {
  time: string; // "15:34:30"
}

const StockTimeSnapshotTableColumn: {
  [CName in keyof StockTimeSnapshotTableModel]: ColumnDefinition<
    CName,
    StockTimeSnapshotTableModel[CName]
  >;
} = {
  ...StockSnapshotTableColumn,
  time: {
    dataType: dateDataType,
  },
};

export const StockSnapshot15Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_15",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
  }
);

export const StockSnapshot18Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_18",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
  }
);

export const StockSnapshot25Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_25",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
  }
);

export const StockSnapshot30Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_30",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
  }
);
