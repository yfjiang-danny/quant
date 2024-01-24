import * as dotenv from "dotenv";
import { Analysis } from "../src/analysis";

dotenv.config();

(async function test() {
  await Analysis.getHistory();
})();
