import * as dotenv from "dotenv";
import { Storage } from "../src/service/storage/storage";
import moment from "moment";
import { getLatestTradeDates } from "../src/utils/date";

dotenv.config();

// (function test() {
//   Storage.getStockInfosFromDB().then((res) => {
//     console.log(res);
//   });
// })();

// (async function test() {
//   const date = moment().format("YYYYMMDD");

//   const limitedStocks = await Storage.getStockSnapshotByDate('20240325').then((res) =>
//     res.data.filter((v) => v.close == v.top_price)
//   );

//   console.log(limitedStocks.length);

// })();

// (async function test() {
//   const dates = getLatestTradeDates(5);
//   const limitedStocks = await Storage.queryUpperLimitStockSymbolByDates(dates);

//   console.log(limitedStocks);
// })();

(async function test() {
  const limitedStocks = await Storage.getStockInfosFromDB();

  console.log(limitedStocks.data.length);
})();
