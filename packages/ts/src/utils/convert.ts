import { MarketType } from "../models/eastmoney/type";

export function getMarket(symbol: string): MarketType {
  switch (symbol.slice(0, 1)) {
    case "0":
    case "3":
      return "SZ";
    case "6":
      return "SH";
    default:
      return "OC";
  }
}
