import axios from "axios";
import { AlphApiParams, IntervalType, SeriesType } from "./type";

const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo`;

export namespace ALPH_API {
  function request(params: AlphApiParams) {
    const query: string[] = [];

    Object.keys(params).forEach((k) => {
      query.push(`${k}=${params[k]}`);
    });

    return axios.get(
      `${process.env.ALPH_API}?apikey=${process.env.ALPH_TOKEN}&${query.join(
        "&"
      )}`,
      {
        headers: { "User-Agent": "request" },
      }
    );
  }

  export function getStockDaily(symbol: string) {
    return request({
      function: "TIME_SERIES_DAILY",
      symbol: symbol,
      outputsize: "compact",
    });
  }

  export function getStockDailyAdjusted(symbol: string) {
    return request({
      function: "TIME_SERIES_DAILY_ADJUSTED",
      symbol: symbol,
      outputsize: "full",
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
