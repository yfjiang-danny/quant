import * as dotenv from "dotenv";
import { dailyCollection } from "../src/collection/collection.next";
import { fillEastStockInfo } from "../src/service/utils";
import { Storage } from "../src/service/storage/storage";

dotenv.config();

(async function testInsert() {
  const stockRes = await Storage.getStockInfoBySymbol("000001");
  if (!stockRes.data) {
    console.log(
      `Update daily info failed: empty basic stocks, ${stockRes.msg}`
    );
    return;
  }

  console.log(stockRes.data);

  const dailyStocks = await fillEastStockInfo([stockRes.data]);

  if (!dailyStocks || dailyStocks.length == 0) {
    console.log(`Update daily info failed: empty daily stocks`);
    return;
  }

  const res = await Storage.insertStockHistories(dailyStocks);

  if (res.data) {
    console.log(`Update daily info success`);
  } else {
    console.log(`Update daily info failed: ${res.msg}`);
  }
})();

// (async function test() {
//   dailyCollection();
// })();
