import { EastMoneyColumns } from "./eastmoney/constant";
import { MaxRiseColumns } from "./rise/constant";
import { SMAColumns } from "./sma/constant";
import { TushareStockColumns } from "./tushare/constant";
import { StockModel } from "./type";

export const StockColumns: Record<keyof StockModel, string> = {
  ...TushareStockColumns,
  ...EastMoneyColumns,
  ...SMAColumns,
  ...MaxRiseColumns,
};
