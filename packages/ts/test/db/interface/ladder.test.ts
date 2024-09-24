import * as dotenv from "dotenv";
import { Storage } from "../../../src/service/storage/storage";
import { convertToHistoryModel } from "../../../src/service/utils";
import { IStockLadderTable } from "../../../src/db/interface/ladder";
import { getLatestTradeDates } from "../../../src/utils/date";

dotenv.config();

// (async function testInsert() {
//   const allStocks = await Storage.getAllStocks("20240119").then(
//     (res) => res.data
//   );

//   if (!allStocks || allStocks.length < 0) {
//     return;
//   }

//   const insertRes = await IStockSnapshotTable.insert(allStocks.map(v => convertToHistoryModel(v)));

//   console.log(insertRes);
// })();

// (async function testUpdate() {
//   const allStocks = await Storage.getAllBasicStocks("20240119").then((res) =>
//     res.data.slice(0, 2).map((v, i) => ({
//       ...v,
//       name: "xxx",
//       symbol: i == 1 ? "000000" : v.symbol,
//     }))
//   );

//   const res = await IBasicStockTable.update(allStocks);

//   console.log(res);
// })();

// (async function testDel() {
//   const allStocks = await Storage.getAllBasicStocks("20240119").then((res) =>
//     res.data.slice(0, 1)
//   );
//   IBasicStockTable.del(allStocks.map((v) => v.symbol as string)).then((res) => {
//     console.log(res);
//   });
// })();

(async function testGetStockLadderSymbolByDates() {
  const dates = getLatestTradeDates(2);
  IStockLadderTable.getStockLadderSymbolByDates(dates).then((res) => {
    console.log(res.rows);
  });
})();
