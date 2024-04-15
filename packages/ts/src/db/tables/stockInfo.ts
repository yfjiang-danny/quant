import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  nameDataType,
  symbolDataType,
} from "./base";
import sql from "sql";

/**
 * 
名称	类型	默认显示	描述
symbol	str	Y	股票代码
name	str	Y	股票名称
area	str	Y	地域
industry	str	Y	所属行业
fullname	str	N	股票全称
enname	str	N	英文全称
cnspell	str	N	拼音缩写
market	str	Y	市场类型（主板/创业板/科创板/CDR）
exchange	str	N	交易所代码
curr_type	str	N	交易货币
list_status	str	N	上市状态 L上市 D退市 P暂停上市
list_date	str	Y	上市日期
delist_date	str	N	退市日期
is_hs	str	N	是否沪深港通标的，N否 H沪股通 S深股通
act_name	str	N	实控人名称
act_ent_type	str	N	实控人企业性质
 * 
 */
export interface StockInfoTableModel extends BaseTableModel {
  symbol?: string;
  name?: string;
  area?: string;
  fullname?: string;
  cnspell?: string;
  enname?: string;
  industry?: string;
  market?: string;
  exchange?: string;
  curr_type?: string;
  list_status?: string;
  list_date?: string;
  delist_date?: string;
  is_hs?: string;
  act_name?: string;
  act_ent_type?: string;
}

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
