import * as dotenv from "dotenv";
import { filterLadder } from "../src/tasks/filterLadder";

dotenv.config();

(async function test() {
  filterLadder().then((res) => {
    console.log(res);
  });
})();
