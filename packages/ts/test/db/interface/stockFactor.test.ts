import * as dotenv from "dotenv";
import { fillStockSMA } from "../../../src/service/factors/sma";
import { Storage } from "../../../src/service/storage/storage";

dotenv.config();

(async function main() {
  const stock = await fillStockSMA({
    symbol: "002404",
    date: "20250527",
    close: 6.28,
  });
  console.log(stock);
})();
