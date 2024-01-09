import * as fs from "fs";
import { access, readdir, writeFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { StockModel } from "../common/type";
import { allStocksJsonFilePath, dateString, dbPath } from "../tasks/common";
import { findLatestTradeDate } from "../utils/date";
import { createDir, readJsonFile } from "../utils/fs";
import { Response } from "./type";

export namespace Storage {
  export function getAllBasicStocks(
    date?: string
  ): Promise<Response<StockModel[]>> {
    if (!date) {
      date = dateString;
    }

    return new Promise<Response<StockModel[]>>((resolve) => {
      readJsonFile<StockModel[]>(
        path.resolve(dbPath, "all", `${dateString}.json`)
      ).then(
        (v) => {
          resolve({ data: v });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      );
    });
  }

  export function saveAllBasicStocks(
    stocks: StockModel[],
    path = allStocksJsonFilePath
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      if (!stocks || stocks.length <= 0) {
        resolve({ data: false, msg: "Empty list, nothing to save" });
      } else {
        access(path, fs.constants.F_OK).then(
          () => {
            const filePath = path + moment().format("hhmmss");
            writeFile(filePath, JSON.stringify(stocks)).then(
              () => {
                resolve({ data: true });
              },
              (e: any) => {
                console.log(e);
                resolve({ data: false, msg: "Write file error!" });
              }
            );
          },
          () => {
            writeFile(path, JSON.stringify(stocks)).then(
              () => {
                resolve({ data: true });
              },
              (e) => {
                console.log(e);
                resolve({ data: false, msg: "Write file error!" });
              }
            );
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
      const dateStr = findLatestTradeDate(date);
      if (!dateStr) {
        resolve({ data: [], msg: "Can not find data" });
        return;
      }
      const fileDir = path.resolve(dbPath, dateStr);
      access(fileDir, fs.constants.F_OK).then(
        () => {
          readdir(fileDir).then(
            (files: string[]) => {
              const promises: Promise<StockModel | null>[] = [];

              files.forEach((file) =>
                promises.push(readJsonFile(path.resolve(fileDir, file)))
              );

              Promise.allSettled(promises).then(
                (res) => {
                  const stocks = res.reduce((res, cur) => {
                    if (cur.status === "fulfilled") {
                      cur.value && res.push(cur.value);
                    }
                    return res;
                  }, [] as StockModel[]);

                  resolve({
                    data: stocks,
                  });
                },
                (e) => {
                  console.log(e);
                  resolve({ data: [], msg: "File read error!" });
                }
              );
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

  export function saveStocks(stocks: StockModel[]) {
    return new Promise<Response<boolean>>((resolve) => {
      const invalidStocks: StockModel[] = [];

      const newStocks = stocks?.filter((v) => {
        const valid = v.date && v.symbol;
        if (!valid) {
          invalidStocks.push(v);
        }
        return valid;
      });

      if (invalidStocks.length > 0) {
        console.log(`Invalid stocks: ${JSON.stringify(invalidStocks)}`);
      }

      if (newStocks.length <= 0) {
        resolve({ data: false, msg: `Empty list, nothing to save!` });
        return;
      }
      const dateStr = newStocks[0].date as string;
      const fileDir = path.resolve(dbPath, dateStr);
      createDir(fileDir).then(
        () => {
          const promises: Promise<void>[] = [];
          newStocks.forEach((v) => {
            const filePath = path.resolve(fileDir, `${v.symbol}.json`);
            promises.push(writeFile(filePath, JSON.stringify(v)));
          });

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
        const date = stock.date;
        const symbol = stock.symbol;
        if (!date || !symbol) {
          console.log(`Invalid stock ${JSON.stringify(stock)}`);

          resolve({ data: false, msg: "Invalid stock, nothing to save" });
        } else {
          const fileDir = path.resolve(dbPath, date);
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
      const latestDateStr = findLatestTradeDate(date);
      if (!latestDateStr) {
        resolve({ data: null, msg: `Can not find latest data of ${date}` });
        return;
      }
      const filePath = path.resolve(dbPath, dateString, `${symbol}.json`);
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
}
