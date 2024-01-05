import * as dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { getAllStocks } from "./allStock";
dotenv.config();

const rootPath = path.resolve(".", ".");

const date = new Date();
const dateString = moment().format("YYYYMMDD");

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

(async function main() {
  //
  let count = 5;
  let success = false;
  while (!success && count > 0) {
    success = await getAllStocks();
    count--;
    if (!success) {
      await sleep(1000 * 60 * 60 * 60 + 1000 * 60);
    }
  }

  //   EastMoney_API.getQuoteSnapshot("600006", "SH").then((res) => {
  //     console.log(JSON.stringify(res));
  //   });
})();
