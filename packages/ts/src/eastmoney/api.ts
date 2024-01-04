import axios from "axios";
import { MarketType, QuoteSnapshotModel, StockInfoModel } from "./type";

export namespace EastMoney_API {
  export function getQuoteSnapshot(symbol: string, market: MarketType) {
    const callbackKey = "jQueryH";
    const timestamp = new Date().getTime();
    return axios
      .get(
        `https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot?id=${symbol}&market=${market}&DC_APP_KEY=dcquotes-service-tweb&DC_TIMESTAMP=${timestamp}&DC_SIGN=81160C38A19B3006FD96BC54300AD889&callback=${callbackKey}&_=${
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
          const close = Number(res.realtimequote.currentPrice);
          const volume = Number(res.realtimequote.volume);
          const turnover = Number(
            res.realtimequote.turnover.slice(
              0,
              res.realtimequote.turnover.length - 2
            )
          );
          const capital = ((volume / (turnover / 100)) * close * 10) / 10000;
          return {
            high: Number(res.realtimequote.high),
            low: Number(res.realtimequote.low),
            capital: capital,
            close: close,
            open: Number(res.realtimequote.open),
            avg: Number(res.realtimequote.avg),
            code: res.code,
            date: res.realtimequote.date,
            name: res.name,
            turnover: turnover,
          } as StockInfoModel;
        }
        return null;
      })
      .catch((err) => {
        console.log(err);

        return null;
      });
  }
}
