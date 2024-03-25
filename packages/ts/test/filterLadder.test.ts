import * as dotenv from "dotenv";
import { fillingLadder } from "../src/service/collection/derivative";

dotenv.config();

(async function test() {
  fillingLadder().then((res) => {
    console.log(res);
  });
})();
