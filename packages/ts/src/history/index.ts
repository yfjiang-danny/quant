import { ALPH_API } from "../alph/api";
import { StockModel } from "../common/type";

export async function getHistory(stock: StockModel) {
  if (!stock.ts_code) {
    return null;
  }

  const symbol = stock.ts_code;

  const histories = await ALPH_API.getStockDaily(symbol);

  if (!histories) {
    return null;
  }

  const res = histories.map((v) => {
    return { ...stock, ...v } as StockModel;
  });

  return res;
}
