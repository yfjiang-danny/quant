import { StockWithSMA } from "./type";

export const SMAColumns: Record<keyof StockWithSMA, string> = {
  sma5: "5日线",
  sma10: "10日线",
  sma20: "20日线",
  sma30: "30日线",
  sma60: "60日线",
  sma120: "120日线",
};
