import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";

import * as dotenv from "dotenv";
import { YAHOO_API } from "../src/service/yahoo/api";
import { Storage } from "../src/service/storage/storage";
import pLimit from "p-limit";
import { logger } from "../src/logs";
import path from "path";
import { dbRootPath, logRootPath } from "../src/common/paths";
import { writeFile } from "fs/promises";
import { iWriteFile, readJsonFile } from "../src/utils/fs";

dotenv.config();

const socksAgent = new SocksProxyAgent("socks5://127.0.0.1:51837");

(async function test() {
  const logPath = path.resolve(logRootPath, "yahoo.test.log");
  //   await YAHOO_API.getHistoryPage("000001", "SZ");
  //   await YAHOO_API.getStockHistory("000001", "SZ");
  const allBasicStock = await Storage.getAllBasicStocks().then(
    (res) => res.data
  );
  // const allBasicStock = readJsonFile(path.resolve(dbRootPath, "all", ))

  if (!allBasicStock || allBasicStock.length <= 0) {
    logger.info("Empty stocks", logPath);
    return;
  }

  let validStocks = allBasicStock.filter(
    (v) =>
      v.symbol &&
      (v.symbol?.startsWith("3") ||
        v.symbol?.startsWith("0") ||
        v.symbol?.startsWith("6"))
  );

  function getMarket(symbol: string) {
    if (symbol?.startsWith("3") || symbol?.startsWith("0")) {
      return "SZ";
    }
    return "SS";
  }

  //   validStocks = validStocks.slice(0, 1);

  //   console.log(validStocks);

  //   const promises = validStocks.reduce((res, cur) => {
  //     if (cur.symbol) {
  //       res.push(YAHOO_API.getStockHistory(cur.symbol, getMarket(cur.symbol)));
  //     }
  //     return res;
  //   }, [] as Promise<unknown[] | null>[]);

  const size = 10;
  const len = validStocks.length;
  const batch = Math.round(len / size);

  let i = 0;

  while (i < batch) {
    const start = i * batch;
    const end = Math.min((i + 1) * batch, len);
    let j = start;
    const promises: Promise<any>[] = [];
    while (j < end) {
      const v = validStocks[j];
      promises.push(
        YAHOO_API.getStockHistory(
          v.symbol as string,
          getMarket(v.symbol as string)
        ).then(
          async (res) => {
            if (res) {
              const b = await iWriteFile(
                path.resolve(dbRootPath, "yahoo", `${v.symbol}.json`),
                JSON.stringify(res),
                false
              ).catch((e) => {
                logger.info(e, logPath);
                return null;
              });
              return b;
            } else {
              return res;
            }
          },
          (e) => {
            logger.info(e, logPath);
            return null;
          }
        )
      );
      j++;
    }

    await Promise.allSettled(promises).then(
      (res) => {
        //
        logger.info(res, logPath);
      },
      (e) => {
        logger.info(e, logPath);
      }
    );

    i++;
  }
})();
