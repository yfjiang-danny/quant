import axios from "axios";
import {
  ALPHStockModel,
  AlphApiParams,
  CreateTokenParams,
  DailyResponse,
  IntervalType,
  SeriesType,
} from "./type";
import { logger } from "../logs";

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
        logger.info({ symbol: symbol, data: res });
        const data = res["Time Series (Daily)"];
        if (data) {
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

  export function createToken(params: CreateTokenParams) {
    return axios
      .postForm(
        `
      https://www.alphavantage.co/create_post/`,
        {
          first_text: "deprecated",
          last_text: "deprecated",
          occupation_text: "Investor",
          ...params,
        },
        {
          headers: {
            Cookie:
              "_ga=GA1.1.438591812.1702815045; csrftoken=mbKMptJGtLfSW8qri78Tdn481gfMi6vk; _ga_FQEDGD32JV=GS1.1.1704627105.6.1.1704627155.0.0.0",
            "X-Csrftoken": "mbKMptJGtLfSW8qri78Tdn481gfMi6vk",
          },
        }
      )
      .then((res) => {
        if (res.data) {
          const text = res.data.text;
          const apiKeyRegex = /[A-Z0-9]{16}/;
          const match = text.match(apiKeyRegex);
          if (match) {
            return match;
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
