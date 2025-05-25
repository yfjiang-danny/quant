import * as dotenv from "dotenv";
import {
  fillSnapshot,
  fillSnapshotBySymbol,
  getUnFillSymbols,
} from "../src/tasks/fillSnapshot";

dotenv.config();

(async function main() {
  //   getUnFillSymbols().then((res) => {
  //     console.log(res);
  //   });
  await fillSnapshot();
})();
