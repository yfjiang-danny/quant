import * as dotenv from "dotenv";
import { fillingLadder } from "../src/collection/derivative";

dotenv.config();

(async function test() {
  fillingLadder("20250519").then((res) => {
    console.log(res);
  });
})();
