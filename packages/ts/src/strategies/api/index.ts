import axios from "axios";

export namespace RESTFUL_API {
  function get(path: string) {
    return axios
      .get(`${process.env.SERVICE_API}${path}`)
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        console.log(e);
        return { data: null };
      });
  }

  export function getAllStocks(date?: string) {
    return get(`/stock/getAllStocks${date ? "?date=" + date : ""}`);
  }

  export function getStockHistories(symbol: string) {
    return get(`/stock/getStockHistories?symbol=${symbol}`);
  }
}
