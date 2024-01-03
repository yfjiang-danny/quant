import * as dotenv from "dotenv";
import { TUSHARE_API } from "./api";

dotenv.config();

function main() {
  TUSHARE_API.getAllStock()
    .then((res) => {
      console.log("res", JSON.stringify(res.data));
    })
    .catch((err) => {
      console.log("err", err);
    });
}

main();
