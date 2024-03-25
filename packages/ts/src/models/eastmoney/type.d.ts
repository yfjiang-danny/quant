export type MarketType = "SZ" | "SH" | "OC";

interface QuoteSnapshotModel {
  code: string;
  name: string;
  sname: string;
  transType: number;
  topprice: string; // 涨停价
  bottomprice: string; // 跌停价
  status: number;
  fivequote: {
    yesClosePrice: string;
    openPrice: string;
    sale1: string;
    sale2: string;
    sale3: string;
    sale4: string;
    sale5: string;
    buy1: string;
    buy2: string;
    buy3: string;
    buy4: string;
    buy5: string;
    sale1_count: number;
    sale2_count: number; //22;
    sale3_count: number; //27;
    sale4_count: number; //76;
    sale5_count: number; //25;
    buy1_count: number; //14;
    buy2_count: number; //51;
    buy3_count: number; //84;
    buy4_count: number; //183;
    buy5_count: number; //39;
  };
  realtimequote: {
    open: string;
    high: string;
    low: string;
    avg: string;
    zd: string; //"-0.37";
    zdf: string; //"-2.53%"; 涨跌幅
    turnover: string; //"5.28%"; 换手率
    currentPrice: string; //"14.28";
    volume: string; //"63064";
    amount: string; //"90342443";
    wp: string; //"30773";
    np: string; //"32292";
    time: string; //"15:34:45";
    date: string; //"20240104";
  };
  tradeperiod: number; //6;
}

export interface EastMoneyStockModel {
  code?: string;
  name?: string;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  date?: string;
  volume?: number;
  change?: string;
  capital?: number;
  turnover?: number;
  avg?: number;
  topPrice?: number;
  bottomPrice?: number;
}
