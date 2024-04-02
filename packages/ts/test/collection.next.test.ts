import * as dotenv from "dotenv";
import { dailyCollection } from "../src/collection/collection.next";

dotenv.config();

(async function test() {
  dailyCollection();
})();
