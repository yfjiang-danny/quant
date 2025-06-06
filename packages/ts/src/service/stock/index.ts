import { StockModel } from "../../models/type";
import { getMarket } from "../../utils/convert";
import { EastMoney_API } from "../../third/eastmoney/api";
import { Storage } from "../storage/storage";
import { Response } from "../storage/type";
import { FileStorage } from "../storage/fileStorage";

export class StockService {
  //   logger: Logger;
  //   constructor() {
  //     this.logger = new Logger(path.resolve(logRootPath, "stock_service.log"));
  //   }

  /**
   *
   * @param date 20240115
   * @returns
   */
  getAllStocks(date?: string) {
    return FileStorage.getAllStocks(date);
  }

  /**
   *
   * @param symbol 000001
   * @returns
   */
  getStockHistories(symbol: string) {
    return FileStorage.getStockHistories(symbol);
  }

  /**
   * 获取过往日线
   * @param symbol 000001
   * @param date 20240115
   * @returns
   */
  getStockDaily(symbol: string, date?: string) {
    return FileStorage.getStock(symbol, date);
  }

  getStockCurrent(symbol: string) {
    const market = getMarket(symbol);

    return Promise.allSettled([
      FileStorage.getStock(symbol),
      EastMoney_API.queryRealtime(symbol, market),
    ]).then(([stock, stockInfo]) => {
      const res: Response<StockModel | null> = {
        data: null,
      };
      if (stock.status == "fulfilled") {
        res.data = { ...stock.value };
      } else {
        res.msg = stock.reason;
      }
      if (stockInfo.status == "fulfilled") {
        res.data = { ...res.data, ...stockInfo.value };
      } else {
        res.msg = stockInfo.reason;
      }
      return res;
    });
  }

  getStockTradeInfo(symbol: string) {
    return EastMoney_API.getQuoteSnapshot(symbol, getMarket(symbol));
  }
}
