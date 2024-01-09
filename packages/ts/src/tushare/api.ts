import axios from "axios";
import { logger } from "../logs";
import { TushareStockColumns } from "./constant";
import { mockAllStockResponse } from "./mock";
import {
  AllStockApiParams,
  ApiParams,
  StockKeys,
  TushareStockModel,
} from "./type";

// http://api.tushare.pro

const StockFields: StockKeys[] = Object.keys(TushareStockColumns);

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

  export function getAllStock(
    params: AllStockApiParams = { exchange: "", list_status: "L" }
  ) {
    return request("stock_basic", {
      fields: StockFields.join(","),
      params: params as Record<string, unknown>,
    })
      .then((res) => {
        logger.info(res.data);
        if (res.status == 200) {
          let responseData = res?.data as any;
          if (responseData?.code != 0) {
            logger.info(`Use mock data`);
            responseData = mockAllStockResponse;
          }
          const data = responseData?.data as {
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
