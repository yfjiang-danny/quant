import { DealTableModel } from "../db/tables/simulation/deal";
import {
  HoldingHistoryTableModel,
  HoldingTableModel,
} from "../db/tables/simulation/holding";

export type BackTestingHoldingModel = Omit<
  HoldingTableModel,
  "createAt" | "update_at" | "account_id" | "deal_id"
>;

export type BackTestingDealModel = Omit<DealTableModel, "account_id">;

export type BackTestingHoldingHistoryModel = Partial<
  Omit<HoldingHistoryTableModel, "id" | "update_at" | "createAt" | "account_id">
>;
