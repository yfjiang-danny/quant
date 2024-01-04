import * as dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { getAllStocks } from "./allStock";

const rootPath = path.resolve(".", ".");

dotenv.config();

const date = new Date();
const dateString = moment().format("YYYYMMDD");

(function main() {
  //
  getAllStocks();

  //   EastMoney_API.getQuoteSnapshot("600006", "SH").then((res) => {
  //     console.log(JSON.stringify(res));
  //   });
})();
