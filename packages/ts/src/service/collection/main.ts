import * as dotenv from "dotenv";
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

export async function collectionTask() {
  logger.info(`Start collection task`);

  // 使用示例
  const allBasicStocks = await getAllStocks();

  const fillResult = await fillTradeInfo(allBasicStocks);
}

// (function main() {
//   initPath();

//   logger.setFilePath(path.resolve(logRootPath, "collection.log"));
//   // 每天晚上 22 点
//   const rule = new RecurrenceRule();
//   rule.dayOfWeek = [1, 2, 3, 4, 5];
//   rule.hour = 22;
//   rule.minute = 35;
//   scheduleJob(rule, collectionTask);

//   process.on("SIGINT", function () {
//     gracefulShutdown().then(() => process.exit(0));
//   });
// })();
