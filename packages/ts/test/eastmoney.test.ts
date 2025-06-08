import * as dotenv from "dotenv";
import { EastMoney_API } from "../src/third/eastmoney/api";
import { KLineToStocks } from "../src/collection/util";
import { getRangeTradeDates } from "../src/utils/date";

dotenv.config();

(async function testGetStockDailysByDate() {
  // EastMoney_API.getStockInfo("000001", "SZ").then((res) => {
  //   console.log(res);
  // });
  // console.log(getRangeTradeDates("20240606", "20250606").length);

  EastMoney_API.getStockKline("301448", "20240606").then((res) => {
    if (res) {
      // console.log(res.data.klines.reverse().slice(0, 5));

      // console.log(res.data.klines);

      console.log(KLineToStocks(res).length);
    }
  });
})();
