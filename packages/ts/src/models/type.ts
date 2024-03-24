import { EastMoneyStockModel } from "./eastmoney/type";
import { StockMaxRiseDay } from "./rise/type";
import { StockWithSMA } from "./sma/type";
import { TushareStockModel } from "./tushare/type";
import { StockLadder } from "./upperlimit/type";

export interface StockBasicModel extends Record<string, unknown> {
  code?: string;
  name?: string;
  close?: string;
  open?: string;
  high?: string;
  low?: string;
  date?: string;
  volume?: string;
}

export type StockModel = TushareStockModel &
  EastMoneyStockModel &
  StockWithSMA &
  StockMaxRiseDay &
  StockLadder;
