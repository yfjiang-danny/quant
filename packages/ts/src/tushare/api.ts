import axios from "axios";
import { AllStockApiParams, ApiParams, StockKeys, StockModel } from "./type";

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
        if (res.status == 200) {
          console.log(res.data);

          return (res?.data as any)?.data as StockModel[];
        }
        return null;
      })
      .catch((e) => {
        console.log(e);
        return null;
      });
  }
}
