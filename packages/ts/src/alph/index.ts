import * as dotenv from "dotenv";
import { ALPH_API } from "./api";

dotenv.config();

function main() {
  ALPH_API.getCompanyOverview("002932.SHZ")
    .then((res) => {
      console.log("res", JSON.stringify(res.data));
    })
    .catch((err) => {
      console.log("err", err);
    });
}

main();
