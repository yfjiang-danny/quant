import * as dotenv from "dotenv";
import { Storage } from "../../../src/service/storage/storage";
import {
  convertToHistoryModel,
  fillEastStockInfo,
} from "../../../src/service/utils";
import { IStockSnapshotTable } from "../../../src/db/interface/snapshot";
import { EastMoney_API } from "../../../src/third/eastmoney/api";

dotenv.config();

// (async function testInsert() {
//   const stockRes = await Storage.getStockInfoBySymbol("000001");
//   if (!stockRes.data) {
//     console.log(
//       `Update daily info failed: empty basic stocks, ${stockRes.msg}`
//     );
//     return;
//   }

//   const dailyStocks = await fillEastStockInfo([stockRes.data]);

//   if (!dailyStocks || dailyStocks.length == 0) {
//     console.log(`Update daily info failed: empty daily stocks`);
//     return;
//   }

//   const res = await Storage.insertStockHistories(dailyStocks);

//   if (res.data) {
//     console.log(`Update daily info success`);
//   } else {
//     console.log(`Update daily info failed: ${res.msg}`);
//   }
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

// (async function testGetStockDailysByDate() {
//   IStockSnapshotTable.getStocksBySymbol("000001", 1).then((res) => {
//     console.log(res.rows);
//   });
// })();
