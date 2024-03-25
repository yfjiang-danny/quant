import * as dotenv from "dotenv";
import { dailyCollection } from "../src/service/collection/collection.next";

dotenv.config();

(async function test() {
    dailyCollection()
})();
