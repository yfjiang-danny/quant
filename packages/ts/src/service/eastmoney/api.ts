import axios from "axios";
import path from "path";
import { logRootPath } from "../../common/paths";
import { logger } from "../../logs";
import {
  EastMoneyStockModel,
  MarketType,
  QuoteSnapshotModel,
} from "../../models/eastmoney/type";
import { MockEastMoneyData } from "./mock";

// https://emhsmarketwg.eastmoneysec.com/api/SHSZQuoteSnapshot

export namespace EastMoney_API {
  const logOutput = path.resolve(logRootPath, "east_money_api.log");
  export function getQuoteSnapshot(symbol: string, market: MarketType) {
    const callbackKey = "jQueryH";
    const timestamp = new Date().getTime();
    if (process.env.TEST) {
      logger.info(`process.env.TEST is ${process.env.TEST}, use mock data.`);
      return new Promise<QuoteSnapshotModel | null>((resolve) => {
        resolve(MockEastMoneyData.find((v) => v.code === symbol) || null);
      });
    }
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
            topPrice: Number(res.topprice),
            bottomPrice: Number(res.bottomprice)
          } as EastMoneyStockModel;
        }
        return null;
      })
      .catch((err) => {
        logger.info(err, logOutput);
        return null;
      });
  }
}
