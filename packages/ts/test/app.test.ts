import axios from "axios";

import { genID } from "../src/utils/id";

(function main() {
  // axios.get("http://10.220.23.47:3800/stock/getAllStocks").then((res) => {
  //   console.log(res);
  // });

  console.log(genID());
})();
