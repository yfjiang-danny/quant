import * as dotenv from "dotenv";
import { fillingLadder } from "../src/collection/derivative";
import { getLatestTradeDates } from "../src/utils/date";

dotenv.config();

(async function test() {
  const latestDates = getLatestTradeDates(10).reverse();

  let i = 0;
  while (i < latestDates.length) {
    const d = latestDates[i];
    i++;

    await fillingLadder(d).then((res) => {
      console.log(res);
    });
  }
})();
