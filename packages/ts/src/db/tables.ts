import sql from "sql";
import { BasicStockModel, LadderStockModel } from "./model";

sql.setDialect("postgres");

export const BasicStockTable = sql.define<string, BasicStockModel>({
  name: "basic_stocks",
  schema: "",
  columns: {
    id: {
      name: "id",
      dataType: "integer",
    },
    name: {
      name: "name",
      dataType: "varchar(250)",
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
      dataType: "varchar(20)",
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
      dataType: "varchar(8)",
    },
    delist_date: {
      name: "delist_date",
      dataType: "varchar(20)",
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

export const LadderTable = sql.define<string, LadderStockModel>({
  name: "ladder",
  schema: "",
  columns: {
    date: {
      name: "date",
      dataType: "varchar(8)",
      notNull: true,
    },
    symbol: {
      name: "symbol",
      dataType: "varchar(20)",
      notNull: true,
    },
    name: {
      name: "name",
      dataType: "varchar(100)",
    },
    ladder: {
      name: "ladder",
      dataType: "smallint",
    },
  },
});
