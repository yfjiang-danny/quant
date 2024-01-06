export interface AlphApiParams extends Record<string, unknown> {
  function: string;
}

export type SeriesType = "open" | "close" | "high" | "low";
export type IntervalType =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "60min"
  | "daily"
  | "weekly"
  | "monthly";

/**
   * "1. Information": "Daily Prices (open, high, low, close) and Volumes",
    "2. Symbol": "002962.SHZ",
    "3. Last Refreshed": "2024-01-05",
    "4. Output Size": "Compact",
    "5. Time Zone": "US/Eastern"
   */
export interface DailyResponse {
  "Meta Data": Record<string, string>;
  "Time Series (Daily)": Record<string, Record<string, string>>;
}

export interface ALPHStockModel {
  code?: string;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  date?: string;
  volume?: number;
}
