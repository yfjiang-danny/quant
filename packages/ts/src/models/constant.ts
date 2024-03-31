import { EastMoneyColumns } from "../../third/eastmoney/constant";
import { TushareStockColumns } from "../../third/tushare/constant";
import { MaxRiseColumns } from "./rise/constant";
import { SMAColumns } from "./sma/constant";
import { StockModel } from "./type";
import { LadderColumns } from "./upperlimit/constant";

export const StockColumns: Record<keyof StockModel, string> = {
  ...TushareStockColumns,
  ...EastMoneyColumns,
  ...SMAColumns,
  ...MaxRiseColumns,
  ...{
    maxTurnoverRiseDay: "换手率连续增长天数",
  },
  ...LadderColumns,
};
