import axios from "axios";
import {
  ALPHStockModel,
  AlphApiParams,
  DailyResponse,
  IntervalType,
  SeriesType,
} from "./type";
import { StockBasicModel } from "../common/type";

const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo`;

export namespace ALPH_API {
  function request<T = any>(params: AlphApiParams) {
    const query: string[] = [];

    Object.keys(params).forEach((k) => {
      query.push(`${k}=${params[k]}`);
    });

    return axios
      .get<T>(
        `${process.env.ALPH_API}?apikey=${process.env.ALPH_TOKEN}&${query.join(
          "&"
        )}`,
        {
          headers: { "User-Agent": "request" },
        }
      )
      .then((res) => {
        if (res.data) {
          return res.data;
        }
        return null;
      });
  }

  export function getStockDaily(symbol: string) {
    return request<DailyResponse | null>({
      function: "TIME_SERIES_DAILY",
      symbol: symbol,
      outputsize: "compact",
    }).then((res) => {
      if (res) {
        const data = res["Time Series (Daily)"];
        const dates = Object.keys(data);
        const stocks: ALPHStockModel[] = [];

        dates.forEach((date) => {
          const stock: ALPHStockModel = {
            code: symbol,
            date: date.replace(/-/gi, ""),
          };

          const v = data[date];
          if (v) {
            const keys = Object.keys(v);
            keys.forEach((key) => {
              if (key.includes("open") && v[key]) {
                stock.open = Number(v[key]);
                return;
              }
              if (key.includes("close") && v[key]) {
                stock.close = Number(v[key]);
                return;
              }
              if (key.includes("high") && v[key]) {
                stock.high = Number(v[key]);
                return;
              }
              if (key.includes("low") && v[key]) {
                stock.low = Number(v[key]);
                return;
              }
              if (key.includes("volume") && v[key]) {
                stock.volume = Number(v[key]);
                return;
              }
            });
          }

          stocks.push(stock);
        });

        return stocks;
      }
      return null;
    });
  }

  export function getCompanyOverview(symbol: string) {
    return request({
      function: "OVERVIEW",
      symbol: symbol,
    });
  }

  /**
   *
   * @param symbol
   * @param period
   * @returns
   */
  export function getSMA({
    symbol,
    period = 5,
    series_type = "close",
    interval = "daily",
  }: {
    symbol: string;
    period?: number;
    series_type?: SeriesType;
    interval?: IntervalType;
  }) {
    return request({
      function: "SMA",
      symbol: symbol,
      interval: interval,
      time_period: period,
      series_type: series_type,
    });
  }
}
