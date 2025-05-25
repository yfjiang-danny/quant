import { BaseTableModel } from "../base";

export interface EntrustmentTableModel extends BaseTableModel {
  account_id: string;
  deal_id: string;
  deal_date: string;
  deal_type: number; // 0 - buy, 1 - sell
  symbol: string;
  count: number;
  price: number;
  amount: number;
  fee: number;
}
