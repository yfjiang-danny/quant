import { BaseTableModel } from "../base";

export interface HoldingTableModel extends BaseTableModel {
  account_id: string;
  id: string;
  deal_ids: string;
  symbol: string;
  count: number;
  buy_price: number;
  cur_price: number;
  interest: number;
  interest_rate: number;
  amount: number;
}

export interface HoldingHistoryTableModel extends BaseTableModel {
  account_id: string;
  id: string;
  deal_ids: string;
  symbol: string;
  buy_date: string;
  sell_date: string;
  buy_price: number;
  sell_price: number;
  count: number;
  interest: number;
  interest_rate: number;
}
