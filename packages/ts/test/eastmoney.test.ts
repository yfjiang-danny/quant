import * as dotenv from "dotenv";
import { EastMoney_API } from "../src/third/eastmoney/api";

dotenv.config();

(async function testGetStockDailysByDate() {
  EastMoney_API.getStockInfo("000001", "SZ").then((res) => {
    console.log(res);
  });
})();
