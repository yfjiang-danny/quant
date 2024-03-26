import * as dotenv from "dotenv";
import { Storage } from "../src/service/storage/storage";
import moment from "moment";

dotenv.config();

// (function test() {
//   Storage.getStockInfosFromDB().then((res) => {
//     console.log(res);
//   });
// })();

(async function test() {
  const date = moment().format("YYYYMMDD");

  const limitedStocks = await Storage.getStockDailysByDate('20240325').then((res) =>
    res.data.filter((v) => v.close == v.top_price)
  );

  console.log(limitedStocks.length);
  
})();
