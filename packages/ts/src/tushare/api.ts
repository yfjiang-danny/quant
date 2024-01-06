import axios from "axios";
import { logger } from "../logs";
import {
  AllStockApiParams,
  ApiParams,
  StockKeys,
  TushareStockModel,
} from "./type";

const StockFields: StockKeys[] = [
  "act_ent_type",
  "act_name",
  "area",
  "cnspell",
  "curr_type",
  "delist_date",
  "enname",
  "exchange",
  "fullname",
  "industry",
  "is_hs",
  "list_date",
];

export namespace TUSHARE_API {
  function request<T>(
    path: string,
    params: Pick<ApiParams, "params" | "fields">
  ) {
    return axios.post<T>(
      process.env.TUSHARE_API as string,
      {
        ...params,
        api_name: path,
        token: process.env.TUSHARE_TOKEN,
      } as ApiParams
    );
  }

  export function getAllStock(params: AllStockApiParams = {}) {
    return request("stock_basic", {
      fields: StockFields.join(","),
      params: params as Record<string, unknown>,
    })
      .then((res) => {
        logger.info(res.data);
        if (res.status == 200) {
          const data = (res?.data as any)?.data as {
            fields: string[];
            items: (string | null)[][];
          };
          if (data) {
            const stocks: TushareStockModel[] = [];
            data.items.forEach((item) => {
              const stock: TushareStockModel = {};
              item.forEach((v, i) => {
                const key = data.fields[i];
                if (key) {
                  stock[key] = v;
                }
              });
              stocks.push(stock);
            });
            return stocks;
          }
        }
        return null;
      })
      .catch((e) => {
        console.log(e);
        return null;
      });
  }
}
