import { StockFactorTableModel } from "../tables/factor";
import { StockSnapshotTableModel } from "../tables/snapshot";

export type MaxCapitalStockModel = StockFactorTableModel &
  StockSnapshotTableModel & { flow_capital_number: number };

export interface Breakthrough20StockModel {
  symbol: string;
  date: string;
  close_number: number;
  flow_capital_number: number;
  sma20_number: number;
  name: string;
  turnover_number: number;
  open: string;
  high: string;
  low: string;
}
