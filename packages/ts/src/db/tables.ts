import sql from "sql";
import {
  StockInfoTableModel,
  StockLadderTableModel,
  StockHistoryTableModel,
  StockSnapshotTableModel,
} from "./model";

sql.setDialect("postgres");

const dateDataType = "varchar(8)";
const symbolDataType = "varchar(20)";
const nameDataType = "varchar(250)";
const numberFixedDataType = "varchar(10)";

const numberDataType = "varchar(10)";

const baseColumns = {
  createAt: {
    dataType: "varchar(19)",
    notNull: true,
  },
  updateAt: {
    dataType: "varchar(19)",
    notNull: true,
  },
};

export const StockInfoTable = sql.define<string, StockInfoTableModel>({
  name: "stock_info",
  schema: "",
  columns: {
    ...baseColumns,
    name: {
      name: "name",
      dataType: nameDataType,
    },
    fullname: {
      name: "fullname",
      dataType: "varchar(250)",
    },
    enname: {
      name: "enname",
      dataType: "varchar(250)",
    },
    cnspell: {
      name: "cnspell",
      dataType: "varchar(250)",
    },
    ts_code: {
      name: "ts_code",
      dataType: "varchar(20)",
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
      notNull: true,
      unique: true,
    },
    market: {
      name: "market",
      dataType: "varchar(20)",
    },
    exchange: {
      name: "exchange",
      dataType: "varchar(10)",
    },
    list_date: {
      name: "list_date",
      dataType: dateDataType,
    },
    delist_date: {
      name: "delist_date",
      dataType: dateDataType,
    },
    industry: {
      name: "industry",
      dataType: "varchar(100)",
    },
    area: {
      name: "area",
      dataType: "varchar(100)",
    },
    curr_type: {
      name: "curr_type",
      dataType: "varchar(20)",
    },
    list_status: {
      name: "list_status",
      dataType: "varchar(4)",
    },
    is_hs: {
      name: "is_hs",
      dataType: "varchar(4)",
    },
    act_name: {
      name: "act_name",
      dataType: "varchar(100)",
    },
    act_ent_type: {
      name: "act_ent_type",
      dataType: "varchar(100)",
    },
  },
});

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

export const StockHistoriesTable = sql.define<string, StockHistoryTableModel>({
  name: "stock_histories",
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
  },
});


export const StockSnapshotTable = sql.define<string, StockSnapshotTableModel>({
  name: "stock_histories",
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
    turnover: {
      dataType: numberFixedDataType,
    },
    volume: {
      dataType: numberFixedDataType,
    },
  },
});
