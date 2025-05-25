import {
  baseColumns,
  BaseTableModel,
  dateDataType,
  IDDataType,
  MaxNumericDataType,
  SmallNumericDataType,
  symbolDataType,
} from "../base";
import sql from "sql";

export interface HoldingTableModel extends BaseTableModel {
  account_id: string;
  deal_ids: string;
  symbol: string;
  count: number;
  buy_price: number;
  cur_price: number;
  interest: number;
  interest_rate: number;
  amount: number;
}

export const HoldingTable = sql.define<string, HoldingTableModel>({
  name: "holding",
  schema: "",
  columns: {
    ...baseColumns,
    account_id: {
      name: "account_id",
      dataType: IDDataType,
      notNull: true,
    },
    deal_ids: {
      name: "deal_ids",
      dataType: "var(255)",
    },
    buy_price: {
      name: "buy_price",
      dataType: SmallNumericDataType,
    },
    cur_price: {
      name: "cur_price",
      dataType: SmallNumericDataType,
    },
    amount: {
      name: "amount",
      dataType: MaxNumericDataType,
    },
    symbol: {
      name: "symbol",
      dataType: symbolDataType,
    },
    count: {
      name: "count",
      dataType: MaxNumericDataType,
    },
    interest: {
      name: "interest",
      dataType: MaxNumericDataType,
    },
    interest_rate: {
      name: "interest_rate",
      dataType: SmallNumericDataType,
    },
  },
});

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

export const HoldingHistoryTable = sql.define<string, HoldingHistoryTableModel>(
  {
    name: "holding_history",
    schema: "",
    columns: {
      ...baseColumns,
      account_id: {
        name: "account_id",
        dataType: IDDataType,
      },
      id: {
        name: "id",
        dataType: IDDataType,
      },
      buy_price: {
        name: "buy_price",
        dataType: SmallNumericDataType,
      },
      sell_price: {
        name: "sell_price",
        dataType: SmallNumericDataType,
      },
      deal_ids: {
        name: "deal_ids",
        dataType: "var(255)",
      },
      buy_date: {
        name: "buy_date",
        dataType: dateDataType,
      },
      sell_date: {
        name: "sell_date",
        dataType: dateDataType,
      },
      symbol: {
        name: "symbol",
        dataType: symbolDataType,
      },
      count: {
        name: "count",
        dataType: MaxNumericDataType,
      },
      interest: {
        name: "interest",
        dataType: MaxNumericDataType,
      },
      interest_rate: {
        name: "interest_rate",
        dataType: SmallNumericDataType,
      },
    },
  }
);
