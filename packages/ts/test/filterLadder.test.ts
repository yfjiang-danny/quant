import * as dotenv from "dotenv";
import { fillingLadder } from "../src/service/collection/derivative";

dotenv.config();

(async function test() {
  fillingLadder('20240325').then((res) => {
    console.log(res);
  });
})();
