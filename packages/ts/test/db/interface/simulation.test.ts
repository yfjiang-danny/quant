import * as dotenv from "dotenv";
import { SimulationStorage } from "../../../src/service/storage/simulation/storage";

dotenv.config();

(async function main() {
  SimulationStorage.createAccount("20日线", 200000).then((res) => {
    console.log(res);
  });
})();
