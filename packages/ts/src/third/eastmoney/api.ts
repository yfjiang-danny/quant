import axios from "axios";
import path from "path";
import { logRootPath } from "../../common/paths";
import { logger } from "../../logs";
import {
  CapitalFlowResponseModel,
  EastMoneyStockKLineResponseModel,
  EastMoneyStockModel,
  MarketType,
  QuoteSnapshotModel,
} from "./type";
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
            time: res.realtimequote.time,
            name: res.name,
            turnover: turnover,
            volume: volume,
            topPrice: Number(res.topprice),
            bottomPrice: Number(res.bottomprice),
            change: res.realtimequote.zd,
            internal: res.realtimequote.np,
            external: res.realtimequote.wp,
            sale1: res.fivequote.sale1,
            sale2: res.fivequote.sale2,
            sale1_count: res.fivequote.sale1_count,
            sale2_count: res.fivequote.sale2_count,
            buy1: res.fivequote.buy1,
            buy2: res.fivequote.buy2,
            buy1_count: res.fivequote.buy1_count,
            buy2_count: res.fivequote.buy2_count,
          } as EastMoneyStockModel;
        }
        return null;
      })
      .catch((err) => {
        logger.info(err, logOutput);
        return null;
      });
  }

  export function getStockCapitalFlow(symbol: string, market: MarketType) {
    const callbackKey = "jQuery1123009847759407393886";
    const timestamp = new Date().getTime();
    // if (process.env.TEST) {
    //   logger.info(`process.env.TEST is ${process.env.TEST}, use mock data.`);
    //   return new Promise<QuoteSnapshotModel | null>((resolve) => {
    //     resolve(MockEastMoneyData.find((v) => v.code === symbol) || null);
    //   });
    // }
    return axios
      .get(
        `${
          process.env.EASTMONEY_API
        }?fltt=2&secids=${symbol}&fields=f62%2Cf184%2Cf66%2Cf69%2Cf72%2Cf75%2Cf78%2Cf81%2Cf84%2Cf87%2Cf64%2Cf65%2Cf70%2Cf71%2Cf76%2Cf77%2Cf82%2Cf83%2Cf164%2Cf166%2Cf168%2Cf170%2Cf172%2Cf252%2Cf253%2Cf254%2Cf255%2Cf256%2Cf124%2Cf6%2Cf278%2Cf279%2Cf280%2Cf281%2Cf282&ut=b2884a393a59ad64002292a3e90d46a5&cb=${callbackKey}_${timestamp}&_=${
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
            const data = JSON.parse(jsonStr) as CapitalFlowResponseModel;
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

  export function getStockKline(symbol: string) {
    const timestamp = new Date().getTime();
    const key = ("3.5.1" + Math.random()).replace(/\D/g, "");
    const callbackKey = `jQuery${key}_${timestamp}`;

    const secid = (symbol.startsWith("6") ? `1.` : "0.") + symbol;

    const url = `${
      process.env.EASTMONEY_KLINE_API
    }?cb=${callbackKey}&secid=${secid}&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&klt=101&fqt=1&end=20500101&lmt=120&_=${
      timestamp + 1
    }`;

    return axios
      .get(url)
      .then((res) => {
        if (res.status == 200) {
          try {
            const jsonStr = (res.data as string).slice(
              callbackKey.length + 1,
              res.data.length - 2
            );
            const data = JSON.parse(
              jsonStr
            ) as EastMoneyStockKLineResponseModel;
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
}
