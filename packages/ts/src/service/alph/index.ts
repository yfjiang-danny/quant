import * as dotenv from "dotenv";
import { ALPH_API } from "./api";

dotenv.config();

function main() {
  ALPH_API.getStockDaily("000001.SHZ")
    .then((res) => {
      console.log("getStockDaily", JSON.stringify(res));
    })
    .catch((err) => {
      console.log("err", err);
    });

  // ALPH_API.getSMA({ symbol: "002962.SHZ" })
  //   .then((res) => {
  //     console.log("getStockDaily", JSON.stringify(res.data));
  //   })
  //   .catch((err) => {
  //     console.log("err", err);
  //   });
}

main();
