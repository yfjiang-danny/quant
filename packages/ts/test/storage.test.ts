import * as dotenv from "dotenv";
import { Storage } from "../src/service/storage/storage";

dotenv.config();

(function test() {
  Storage.getStockInfosFromDB().then((res) => {
    console.log(res);
  });
})();
