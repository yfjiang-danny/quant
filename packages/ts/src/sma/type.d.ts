export interface StockWithSMA extends Record<string, unknown> {
  date?: string;
  close?: number;
  sma5?: number;
  sma10?: number;
  sma20?: number;
  sma30?: number;
  sma60?: number;
  sma120?: number;
}
