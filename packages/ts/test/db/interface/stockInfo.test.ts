import * as dotenv from "dotenv";
import { IStockInfoTable } from "../../../src/db/interface/stockInfo";

dotenv.config();

// (async function testInsert() {
//   const allStocks = await Storage.getAllBasicStocks("20240119").then(
//     (res) => res.data
//   );

//   const insertRes = await IStockInfoTable.insert(allStocks);

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

//   const res = await IStockInfoTable.update(allStocks);

//   console.log(res);
// })();

// (async function testDel() {
//   const allStocks = await Storage.getAllBasicStocks("20240119").then((res) =>
//     res.data.slice(0, 1)
//   );
//   IStockInfoTable.del(allStocks.map((v) => v.symbol as string)).then((res) => {
//     console.log(res);
//   });
// })();

(async function testGetAllStocks() {
  IStockInfoTable.getAllStocks().then((res) => {
    console.log(res.rowCount);
  });
})();

// (async function testGetStockInfoBySymbol() {
//   IStockInfoTable.getStockInfoBySymbol("000001").then((res) => {
//     console.log(res);
//   });
// })();
