import * as dotenv from "dotenv";
import { IStrategyTable } from "../../../src/db/interface/strategy/strategy";
import { v4 } from "uuid";

dotenv.config();

(async function testGetStockLadderSymbolByDates() {
  //   console.log(v4());

  IStrategyTable.insert({
    name: "突破20日线",
    date: "20250526",
    content: "002297,600658,603569",
  }).then((res) => {
    console.log(res.rows);
  });
})();
