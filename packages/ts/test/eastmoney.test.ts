import * as dotenv from "dotenv";
import { EastMoney_API } from "../src/third/eastmoney/api";
import { KLineToStocks } from "../src/collection/util";

dotenv.config();

(async function testGetStockDailysByDate() {
  // EastMoney_API.getStockInfo("000001", "SZ").then((res) => {
  //   console.log(res);
  // });
  EastMoney_API.getStockKline("000001").then((res) => {
    if (res) {
      // console.log(res.data.klines.reverse().slice(0, 5));

      console.log(res.data.klines);

      // console.log(KLineToStocks(res));
    }
  });
})();
