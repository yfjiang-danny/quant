import sql, { ColumnDefinition } from "sql";
import {
  baseColumns,
  BaseTableModel,
  DateDataType,
  IntegerDataType,
  NameDataType,
  NumberFixedDataType,
  SymbolDataType,
} from "./base";

export interface StockSnapshotTableModel extends BaseTableModel {
  date: string;
  time: string | null | undefined;
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
    dataType: DateDataType,
    notNull: true,
    primaryKey: true,
  },
  time: {
    dataType: DateDataType,
  },
  symbol: {
    dataType: SymbolDataType,
    notNull: true,
    primaryKey: true,
  },
  name: {
    dataType: NameDataType,
  },
  open: {
    dataType: NumberFixedDataType,
  },
  close: {
    dataType: NumberFixedDataType,
  },
  avg: {
    dataType: NumberFixedDataType,
  },
  high: {
    dataType: NumberFixedDataType,
  },
  low: {
    dataType: NumberFixedDataType,
  },
  top_price: {
    dataType: NumberFixedDataType,
  },
  bottom_price: {
    dataType: NumberFixedDataType,
  },
  change: {
    dataType: NumberFixedDataType,
  },
  turnover: {
    dataType: NumberFixedDataType,
  },
  volume: {
    dataType: NumberFixedDataType,
  },
  internal: {
    dataType: NumberFixedDataType,
  },
  external: {
    dataType: NumberFixedDataType,
  },
  buy1: {
    dataType: NumberFixedDataType,
  },
  buy2: {
    dataType: NumberFixedDataType,
  },
  sale1: {
    dataType: NumberFixedDataType,
  },
  sale2: {
    dataType: NumberFixedDataType,
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
    dataType: DateDataType,
  },
};

export const StockSnapshot15Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_15",
    schema: "",
    columns: StockTimeSnapshotTableColumn,
  }
);

export const StockSnapshot20Table = sql.define<string, StockSnapshotTableModel>(
  {
    name: "stock_snapshots_20",
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
