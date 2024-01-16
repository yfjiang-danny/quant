import * as dotenv from "dotenv";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import path from "path";
import { initPath, logRootPath } from "../../common/paths";
import { StockModel } from "../../common/type";
import { logger } from "../../logs";
import { Storage } from "../../storage/storage";
import { fillEastStockInfo } from "../../tasks/utils";
import { TUSHARE_API } from "../../tushare/api";
import { TushareStockModel } from "../../tushare/type";

dotenv.config();

function getAllStocks() {
  return new Promise<TushareStockModel[] | null>((resolve) => {
    TUSHARE_API.getAllStock().then((res) => {
      if (res) {
        Storage.saveAllBasicStocks(res).then(
          (success) => {
            if (success) {
              resolve(res);
            } else {
              resolve(null);
            }
          },
          (e) => {
            console.log(e);

            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  });
}

function fillTradeInfo(stocks: TushareStockModel[] | null) {
  return new Promise<StockModel[]>((resolve) => {
    if (stocks) {
      fillEastStockInfo(stocks).then((fillStocks) => {
        Storage.saveStocks(fillStocks).then((res) => {
          if (res.msg) {
            console.log(res.msg);
          }
        });
        resolve(fillStocks);
      });
    } else {
      console.log(`BasicStocks is null, call Storage.getAllBasicStocks`);

      Storage.getAllBasicStocks().then((res) => {
        if (res.msg) {
          console.log(res.msg);
        } else {
          const allStocks = res.data;
          fillEastStockInfo(allStocks).then((fillStocks) => {
            Storage.saveStocks(fillStocks).then((res) => {
              if (res.msg) {
                console.log(res.msg);
              }
            });
            resolve(fillStocks);
          });
        }
      });
    }
  });
}

async function collectionTask() {
  logger.info(`Start collection task`);

  // 使用示例
  const allBasicStocks = await getAllStocks();

  const fillResult = await fillTradeInfo(allBasicStocks);
}

(function main() {
  initPath();

  logger.setFilePath(path.resolve(logRootPath, "collection.log"));
  // 每天晚上 22 点
  scheduleJob("* * 22 * *", collectionTask);

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => process.exit(0));
  });
})();
