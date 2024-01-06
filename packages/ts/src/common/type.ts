import { EastMoneyStockModel } from "../eastmoney/type";
import { StockWithSMA } from "../sma/type";
import { TushareStockModel } from "../tushare/type";

export interface StockBasicModel extends Record<string, unknown> {
  code?: string;
  name?: string;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  date?: string;
  volume?: number;
}

export type StockModel = TushareStockModel & EastMoneyStockModel & StockWithSMA;
