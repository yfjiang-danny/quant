import axios from "axios";

(function main() {
  axios.get("http://10.220.23.47:3800/stock/getAllStocks").then((res) => {
    console.log(res);
  });
})();
