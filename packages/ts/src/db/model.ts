import { TushareStockModel } from "../models/tushare/type";

export interface BasicStockModel extends TushareStockModel {
  id: number;
}

export interface LadderStockModel {
  date: string;
  symbol: string;
  name: string;
  ladder: number;
}
