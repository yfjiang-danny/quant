import * as dotenv from "dotenv";
import { dailyCollection } from "../src/collection/collection.next";
import { Strategies } from "../src/strategies";

dotenv.config();

(async function test() {
    Strategies.filterStocks(undefined, '20240410')
})();
  