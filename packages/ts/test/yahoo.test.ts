import { SocksProxyAgent } from "socks-proxy-agent";

import * as dotenv from "dotenv";
import { access } from "fs/promises";
import path from "path";
import { dbRootPath, logRootPath } from "../src/common/paths";
import { logger } from "../src/logs";
import { StockModel } from "../src/models/type";
import { Storage } from "../src/service/storage/storage";
import { YAHOO_API } from "../src/service/yahoo/api";
import { iWriteFile } from "../src/utils/fs";

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

  logger.info(`Valid: ${validStocks.length}`, logPath);

  const filterStocks: StockModel[] = [];

  for (const v of validStocks) {
    const filePath = path.resolve(dbRootPath, "yahoo", `${v.symbol}.json`);
    await access(filePath).then(
      () => {
        //
        logger.info(`${filePath} already exist, pass.`);
      },
      (e) => {
        filterStocks.push(v);
      }
    );
  }

  logger.info(`Total: ${filterStocks.length}`, logPath);

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

  const size = 5;
  const len = filterStocks.length;
  const batch = Math.round(len / size);

  let i = 0,
    count = 0;

  while (i < batch) {
    const start = i * batch;
    const end = Math.min((i + 1) * batch, len);
    let j = start;
    const promises: Promise<any>[] = [];
    while (j < end) {
      const v = filterStocks[j];
      promises.push(
        YAHOO_API.getStockHistory(
          v.symbol as string,
          getMarket(v.symbol as string)
        ).then(
          async (res) => {
            if (res) {
              const filePath = path.resolve(
                dbRootPath,
                "yahoo",
                `${v.symbol}.json`
              );
              const b = await iWriteFile(filePath, JSON.stringify(res), false)
                .then(
                  () => {
                    logger.info(`Write complete: ${filePath}`, logPath);
                    return;
                  },
                  (e) => {
                    logger.info(e, logPath);
                    return;
                  }
                )
                .catch((e) => {
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
        res.forEach((v) => {
          if (v.status === "fulfilled") {
            count++;
          }
        });
      },
      (e) => {
        logger.info(e, logPath);
      }
    );

    i++;
  }

  logger.info(`Complete ${count}`, logPath);
})();
