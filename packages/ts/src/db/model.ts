import { TushareStockModel } from "../models/tushare/type";

export interface BaseTableModel {
  createAt?: string;
  updateAt?: string;
}

export interface StockInfoTableModel
  extends BaseTableModel,
    TushareStockModel {}

export interface StockLadderTableModel extends BaseTableModel {
  date: string;
  symbol: string;
  name: string;
  ladder: number;
}

export interface StockHistoryTableModel extends BaseTableModel {
  symbol: string;
  name: string;
  close: string;
  open: string;
  high: string;
  low: string;
  change?: string;
  date: string;
  volume: string;
  turnover: string;
  avg: string;
  top_price?: string;
  bottom_price?: string;
}
