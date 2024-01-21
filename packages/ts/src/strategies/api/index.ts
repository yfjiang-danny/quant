import axios from "axios";
import path from "path";
import { logRootPath } from "../../common/paths";
import { logger } from "../../logs";

export namespace RESTFUL_API {
  const logPath = path.resolve(logRootPath, "resful_api.log");
  function get(path: string) {
    const url = `${process.env.SERVICE_API}${path}`;
    return axios
      .get(url)
      .then((res) => {
        logger.info({ url: url, res: res.data }, logPath);
        return res.data;
      })
      .catch((e) => {
        logger.info(e, logPath);
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
