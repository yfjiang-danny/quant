import * as dotenv from "dotenv";

import { collectFactor, collectFactorBySymbol } from "../collection/factor";
import { getRangeTradeDates } from "../utils/date";
dotenv.config();

(async function main() {
  const dates = getRangeTradeDates("20240613", "20250519");

  // let i = 0;
  // while (i < dates.length) {
  //   const d = dates[i];
  //   i++;

  //   await collectFactor(d);
  // }
  collectFactorBySymbol("20250519");
})();
