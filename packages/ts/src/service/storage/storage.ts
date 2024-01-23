import * as fs from "fs";
import { access, readdir, writeFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { allStockRootPath, historyRootPath } from "../../common/paths";
import { StockModel } from "../../models/type";
import { findExistDate } from "../../utils/date";
import {
  createDir,
  iWriteFile,
  readJsonFile,
  readJsonFileInBatch,
} from "../../utils/fs";
import { Response } from "./type";
import pLimit from "p-limit";

export namespace Storage {
  export function getAllBasicStocks(
    date?: string
  ): Promise<Response<StockModel[]>> {
    return new Promise<Response<StockModel[]>>((resolve) => {
      const dateStr = findExistDate(allStockRootPath, date, ".json");
      if (!dateStr) {
        resolve({ data: [], msg: "Can not find data" });
        return;
      }
      const filePath = path.resolve(allStockRootPath, `${dateStr}.json`);

      readJsonFile<StockModel[]>(filePath).then(
        (v) => {
          resolve({ data: v || [] });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      );
    });
  }

  export function saveAllBasicStocks(
    stocks: StockModel[],
    dateString?: string
  ): Promise<Response<boolean>> {
    if (!dateString) {
      dateString = moment().format("YYYYMMDD");
    }
    return new Promise<Response<boolean>>((resolve) => {
      if (!stocks || stocks.length <= 0) {
        resolve({ data: false, msg: "Empty list, nothing to save" });
      } else {
        const filePath = path.resolve(allStockRootPath, `${dateString}.json`);
        writeFile(filePath, JSON.stringify(stocks)).then(
          () => {
            resolve({ data: true });
          },
          (e: any) => {
            console.log(e);
            resolve({ data: false, msg: "Write file error!" });
          }
        );
      }
    });
  }

  /**
   *
   * @param date
   * @returns
   */
  export function getAllStocks(date?: string): Promise<Response<StockModel[]>> {
    return new Promise<Response<StockModel[]>>((resolve) => {
      const dateStr = findExistDate(historyRootPath, date);
      if (!dateStr) {
        resolve({ data: [], msg: "Can not find data" });
        return;
      }
      const fileDir = path.resolve(historyRootPath, dateStr);
      access(fileDir, fs.constants.F_OK).then(
        () => {
          readdir(fileDir).then(
            (files: string[]) => {
              readJsonFileInBatch<StockModel>(
                files.map((file) => path.resolve(fileDir, file))
              ).then((res) => {
                resolve({ data: res.filter((v) => !!v) as StockModel[] });
              });
            },
            (e) => {
              console.log(e);
              resolve({ data: [] });
            }
          );
        },
        (e) => {
          console.log(e);
          resolve({ data: [], msg: "File do not exist!" });
        }
      );
    });
  }

  export function saveStocks(stocks: StockModel[], override = false) {
    return new Promise<Response<boolean>>((resolve) => {
      const invalidStocks: StockModel[] = [];

      const newStocks = stocks?.filter((v) => {
        const valid = v && v.date && v.symbol;
        if (!valid) {
          invalidStocks.push(v);
        }
        return valid;
      });

      if (invalidStocks.length > 0) {
        console.log(`Invalid stocks: ${JSON.stringify(invalidStocks)}`);
      }

      if (!newStocks || newStocks.length <= 0) {
        resolve({ data: false, msg: `Empty list, nothing to save!` });
        return;
      }

      const arr: StockModel[][] = [];

      let i = 0,
        currentDate = newStocks[0]?.date as string;
      while (i < newStocks.length) {
        const temp: StockModel[] = [];

        while (i < newStocks.length) {
          temp.push({ ...newStocks[i] });
          i++;
          if (
            newStocks[i] &&
            newStocks[i].date &&
            newStocks[i].date != currentDate
          ) {
            break;
          }
        }

        arr.push(temp);

        currentDate = newStocks[i]?.date as string;
      }

      arr.forEach(async (s) => {
        await saveStocksInOneDate(s, override);
      });

      resolve({ data: true });

      // const limit = pLimit(2);
      // const promises = arr.map((v) =>
      //   limit(() => saveStocksInOneDate(v, override))
      // );
      // Promise.allSettled(promises).then(
      //   () => {
      //     resolve({ data: true });
      //   },
      //   (e) => {
      //     console.log(e);

      //     resolve({ data: false, msg: "Write file error" });
      //   }
      // );
    });
  }

  export function saveStocksInOneDate(stocks: StockModel[], override = false) {
    return new Promise<Response<boolean>>((resolve) => {
      const invalidStocks: StockModel[] = [];

      const newStocks = stocks?.filter((v) => {
        const valid = v && v.date && v.symbol;
        if (!valid) {
          invalidStocks.push(v);
        }
        return valid;
      });

      if (invalidStocks.length > 0) {
        console.log(`Invalid stocks: ${JSON.stringify(invalidStocks)}`);
      }

      if (!newStocks || newStocks.length <= 0) {
        resolve({ data: false, msg: `Empty list, nothing to save!` });
        return;
      }

      const dateStr = newStocks[0].date as string;
      const fileDir = path.resolve(historyRootPath, dateStr);

      createDir(fileDir).then(
        () => {
          const limit = pLimit(10);

          const promises = newStocks.map((v) =>
            limit(() =>
              iWriteFile(
                path.resolve(fileDir, `${v.symbol}.json`),
                JSON.stringify(v),
                override
              )
            )
          );

          Promise.allSettled(promises).then(
            (values) => {
              values.forEach((v) => {
                if (v.status === "rejected") {
                  console.log(v.reason);
                }
              });
              resolve({ data: true });
            },
            (e) => {
              console.log(e);

              resolve({ data: false, msg: "Write file error" });
            }
          );
        },
        () => {
          resolve({ data: false, msg: `Create ${fileDir} error!` });
        }
      );
    });
  }

  export function saveStock(stock: StockModel): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      if (!stock) {
        resolve({ data: false, msg: "Stock info is empty, nothing to save" });
      } else {
        const dateStr = stock.date;
        const symbol = stock.symbol;
        if (!dateStr || !symbol) {
          console.log(`Invalid stock ${JSON.stringify(stock)}`);

          resolve({ data: false, msg: "Invalid stock, nothing to save" });
        } else {
          const fileDir = path.resolve(historyRootPath, dateStr);
          const filePath = path.resolve(fileDir, `${symbol}.json`);

          createDir(fileDir).then(
            () => {
              writeFile(filePath, JSON.stringify(stock)).then(
                () => {
                  resolve({ data: true });
                },
                (e) => {
                  console.log(e);

                  resolve({ data: false, msg: "Write file error!" });
                }
              );
            },
            (e) => {
              console.log(e);

              resolve({ data: false, msg: `Create ${fileDir} error!` });
            }
          );
        }
      }
    });
  }

  export function getStock(symbol: string, date?: string) {
    return new Promise<Response<StockModel | null>>((resolve) => {
      const latestDateStr = findExistDate(historyRootPath, date);
      if (!latestDateStr) {
        resolve({ data: null, msg: `Can not find latest data of ${date}` });
        return;
      }
      const filePath = path.resolve(
        historyRootPath,
        latestDateStr,
        `${symbol}.json`
      );
      readJsonFile<StockModel>(filePath).then(
        (v) => {
          resolve({ data: v });
        },
        (e) => {
          resolve({ data: null, msg: e });
        }
      );
    });
  }

  export function getStockHistories(
    symbol: string
  ): Promise<Response<StockModel[]>> {
    return new Promise<Response<StockModel[]>>((resolve) => {
      readdir(historyRootPath)
        .then(
          (dateStrings: string[]) => {
            readJsonFileInBatch<StockModel>(
              dateStrings.map((dateStr) =>
                path.resolve(historyRootPath, dateStr, `${symbol}.json`)
              )
            ).then((res) => {
              resolve({ data: res.filter((v) => !!v) as StockModel[] });
            });
          },
          (e) => {
            console.log(e);
            resolve({ data: [] });
          }
        )
        .catch(() => {
          resolve({ data: [] });
        });
    });
  }
}
