import { BaseTableModel } from "../base";

export interface AccountTableModel extends BaseTableModel {
  account_id: string;
  amount: number;
  holding: number;
  available: number;
  interest: number;
  interest_rate: number;
  init_amount: number;
}
