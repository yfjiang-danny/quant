import { readdir } from "fs/promises";
import moment from "moment";
import path from "path";
import { dbRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { StockWithSMA } from "../models/sma/type";
import { StockModel } from "../models/type";
import { YahooStockModel } from "../third/yahoo/type";
import { calculateMovingAverage } from "../service/factors/sma";
import { Storage } from "../service/storage/storage";
import { readJsonFileInBatch } from "../utils/fs";

export namespace Analysis {
  function log(msg: unknown) {
    logger.info(msg, path.resolve(logRootPath, "analysis.log"));
  }

  function getFilePaths() {
    return new Promise<string[]>((resolve) => {
      const dir = path.resolve(dbRootPath, "yahoo");
      readdir(dir)
        .then(
          (fileNames) => {
            resolve(fileNames.map((fileName) => path.resolve(dir, fileName)));
          },
          (e) => {
            log(e);
            resolve([]);
          }
        )
        .catch((e) => {
          log(e);
          resolve([]);
        });
    });
  }

  async function fillSMAInBatch(filePaths: string[]) {
    let data = await readJsonFileInBatch(filePaths, filePaths.length);
    if (data) {
      const stockArr = data
        .map((histories, i) => {
          if (histories) {
            return (histories as YahooStockModel[])
              .map((v) => {
                if (!v) return null;
                const stock: StockModel = {};

                const open = Number(v.Open);
                if (!isNaN(open)) {
                  stock.open = open;
                }

                const close = Number(v.Close);
                if (!isNaN(close)) {
                  stock.close = close;
                }

                const high = Number(v.High);
                if (!isNaN(high)) {
                  stock.high = high;
                }

                const low = Number(v.Low);
                if (!isNaN(low)) {
                  stock.low = low;
                }

                const volume = Number(v.Volume);
                if (!isNaN(volume)) {
                  stock.volume = volume;
                }

                if (v.Date) {
                  stock.date = moment(v.Date).format("YYYYMMDD");
                }

                const match = filePaths[i].match(/([\d]+)\.json/);

                if (match && match[1]) {
                  stock.symbol = match[1];
                }

                return stock;
              })
              .filter((v) => !!v);
          }
          return null;
        })
        .filter((v) => !!v);

      const smaStocksArr = stockArr.map((v) => {
        if (v) {
          return calculateMovingAverage(
            calculateMovingAverage(
              calculateMovingAverage(
                calculateMovingAverage(
                  calculateMovingAverage(
                    calculateMovingAverage(v as StockModel[], 5),
                    10
                  ),
                  20
                ),
                30
              ),
              60
            ),
            120
          );
        } else {
          return null;
        }
      });

      if (!smaStocksArr) {
        log(`smaStocksArr is empty`);
        return;
      }

      let i = 0;
      while (i < smaStocksArr.length) {
        await Storage.saveStocks(smaStocksArr[i] as StockModel[]);
        i++;
      }
    }
  }

  export async function getHistory() {
    const filePaths = await getFilePaths();
    if (filePaths.length <= 0) {
      log(`Empty filePaths`);
      return;
    }

    const size = 5;
    const len = filePaths.slice(5).length;
    const batch = Math.round(len / size);
    let i = 0;
    while (i < batch) {
      const start = i * size,
        end = Math.min((i + 1) * size, len);
      await fillSMAInBatch(filePaths.slice(start, end));
      i++;
    }
  }
}
