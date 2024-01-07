import axios from "axios";
import { MarketType, QuoteSnapshotModel, EastMoneyStockModel } from "./type";
import { logger } from "../logs";

// https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot

export namespace EastMoney_API {
  export function getQuoteSnapshot(symbol: string, market: MarketType) {
    const callbackKey = "jQueryH";
    const timestamp = new Date().getTime();
    return axios
      .get(
        `${
          process.env.EASTMONEY_API
        }?id=${symbol}&market=${market}&DC_APP_KEY=dcquotes-service-tweb&DC_TIMESTAMP=${timestamp}&DC_SIGN=81160C38A19B3006FD96BC54300AD889&callback=${callbackKey}&_=${
          timestamp + 1
        }`
      )
      .then((res) => {
        if (res.status == 200) {
          try {
            const jsonStr = (res.data as string).slice(
              callbackKey.length + 1,
              res.data.length - 2
            );
            const data = JSON.parse(jsonStr) as QuoteSnapshotModel;
            return data;
          } catch (error) {
            return null;
          }
        }
        return null;
      })
      .catch((e) => {
        console.log(e);

        return null;
      });
  }

  export function getStockInfo(symbol: string, market: MarketType) {
    return getQuoteSnapshot(symbol, market)
      .then((res) => {
        if (res) {
          logger.info(res);
          const close = Number(res.realtimequote.currentPrice);
          const volume = Number(res.realtimequote.volume);
          const turnover = Number(
            res.realtimequote.turnover.slice(
              0,
              res.realtimequote.turnover.length - 1
            )
          );
          const avg = Number(res.realtimequote.avg);
          const capital =
            ((volume / (turnover / 100)) * close) / Math.pow(10, 6);
          return {
            high: Number(res.realtimequote.high),
            low: Number(res.realtimequote.low),
            capital: capital,
            close: close,
            open: Number(res.realtimequote.open),
            avg: avg,
            code: res.code,
            date: res.realtimequote.date,
            name: res.name,
            turnover: turnover,
            volume: volume,
          } as EastMoneyStockModel;
        }
        return null;
      })
      .catch((err) => {
        console.log(err);

        return null;
      });
  }
}
