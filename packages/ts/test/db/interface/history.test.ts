import * as dotenv from "dotenv";
import { Storage } from "../../../src/service/storage/storage";
import { IStockHistoryTable } from "../../../src/db/interface/history";
import { StockHistoryTableModel } from "../../../src/db/model";
import { convertToHistoryModel } from "../../../src/service/utils";

dotenv.config();

// (async function testInsert() {
//   const allStocks = await Storage.getAllStocks("20240119").then(
//     (res) => res.data
//   );

//   if (!allStocks || allStocks.length < 0) {
//     return;
//   }

//   const insertRes = await IStockHistoryTable.insert(allStocks.map(v => convertToHistoryModel(v)));

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

(async function testGetStockDailysByDate() {
  IStockHistoryTable.getStocksByDate('20240325').then(res => {
    console.log(res.rows);
    
  })
})();
