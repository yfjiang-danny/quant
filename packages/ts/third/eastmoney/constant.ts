import { EastMoneyStockModel } from "./type";

export const EastMoneyColumns: Record<keyof EastMoneyStockModel, string> = {
  code: "股票代码",
  name: "股票名称",
  open: "开盘价",
  high: "最高价",
  low: "最低价",
  close: "收盘价",
  capital: "流通市值(亿)",
  avg: "均价",
  turnover: "换手率",
  volume: "成交量(手)",
  date: "日期",
  topPrice: "涨停价",
  bottomPrice: "跌停价",
  change: "涨跌幅",
};
