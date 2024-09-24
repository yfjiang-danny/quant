import * as fs from "fs";
import { access, readdir, writeFile } from "fs/promises";
import moment from "moment";
import pLimit from "p-limit";
import path from "path";
import {
  allStockRootPath,
  historyRootPath,
  upperLimitRootPath,
} from "../../common/paths";
import { StockModel } from "../../models/type";
import { findExistDate } from "../../utils/date";
import {
  createDir,
  iWriteFile,
  readJsonFile,
  readJsonFileInBatch,
} from "../../utils/fs";
import { Response } from "./type";
import { TushareStockModel } from "../../third/tushare/type";
import { convertToHistoryModel } from "../utils";
import { BinaryNode } from "sql";
import { IStockInfoTable } from "../../db/interface/stockInfo";
import { IStockSnapshotTable } from "../../db/interface/snapshot";
import {
  StockSnapshotTable,
  StockSnapshotTableModel,
} from "../../db/tables/snapshot";
import { StockInfoTableModel } from "../../db/tables/stockInfo";
import { IStockLadderTable } from "../../db/interface/ladder";
import { StockLadderTableModel } from "../../db/tables/ladder";

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

  export function getStockInfosFromDB(): Promise<Response<StockModel[]>> {
    return new Promise<Response<StockModel[]>>((resolve, reject) => {
      IStockInfoTable.getAllStocks()
        .then(
          (res) => {
            if (res && res.rows) {
              resolve({ data: res.rows as unknown as StockModel[] });
            } else {
              resolve({ data: [] });
            }
          },
          (e) => {
            resolve({ data: [], msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: [], msg: e });
        });
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

  export function insertStockInfos(
    stocks: TushareStockModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve, reject) => {
      IStockInfoTable.insert(
        stocks.map((v) => {
          const nv = { ...v };
          delete nv.ts_code;
          return nv;
        })
      )
        .then(
          (res) => {
            resolve({ data: true });
          },
          (e) => {
            resolve({ data: false });
          }
        )
        .catch((e) => {
          resolve({ data: false });
        });
    });
  }

  /**
   * Get all stocks data with a specify date, default latest date.
   * @param date specify date
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

  export function insertStockHistories(
    stocks: StockModel[],
    shouldUpdate?: boolean
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      IStockSnapshotTable.insert(
        stocks.map((v) => {
          return convertToHistoryModel(v);
        }),
        shouldUpdate
      )
        .then(
          (res) => {
            resolve({ data: true });
          },
          (e) => {
            resolve({ data: false, msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: false, msg: e });
        });
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
              resolve({
                data: res
                  .filter((v) => !!v && !!v.date)
                  .sort(
                    (a, b) => Number(b?.date) - Number(a?.date)
                  ) as StockModel[],
              });
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

  export function getStockHistoriesFromDB(
    symbol: string,
    limit?: number,
    offset?: number
  ): Promise<Response<StockSnapshotTableModel[]>> {
    return new Promise<Response<StockSnapshotTableModel[]>>((resolve) => {
      IStockSnapshotTable.getStocksBySymbol(symbol, limit, offset)
        .then(
          (res) => {
            resolve({ data: res.rows as unknown as StockSnapshotTableModel[] });
          },
          (e) => {
            resolve({ data: [], msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: [], msg: e });
        });
    });
  }

  export function getStockSnapshotByDate(
    date?: string
  ): Promise<Response<StockSnapshotTableModel[]>> {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return new Promise<Response<StockSnapshotTableModel[]>>((resolve) => {
      IStockSnapshotTable.getStocksByDate(date as string)
        .then(
          (res) => {
            resolve({ data: res.rows as unknown as StockSnapshotTableModel[] });
          },
          (e) => {
            resolve({ data: [], msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: [], msg: e });
        });
    });
  }

  export function getStockDetailsByDate(
    date?: string
  ): Promise<Response<(StockSnapshotTableModel & StockInfoTableModel)[]>> {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return new Promise<
      Response<(StockSnapshotTableModel & StockInfoTableModel)[]>
    >((resolve) => {
      IStockSnapshotTable.getStockDetailsByDate(date as string)
        .then(
          (res) => {
            resolve({
              data: res.rows as unknown as (StockSnapshotTableModel &
                StockInfoTableModel)[],
            });
          },
          (e) => {
            resolve({ data: [], msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: [], msg: e });
        });
    });
  }

  export function updateStockHistories(
    stocks: StockSnapshotTableModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      IStockSnapshotTable.update(stocks)
        .then(
          (res) => {
            resolve({ data: true });
          },
          (e) => {
            resolve({ data: false, msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: false, msg: e });
        });
    });
  }

  /**
   *
   * @param stocks
   * @returns
   */
  export function saveUpperLimitStocks(
    stocks: StockModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      const findIndex = stocks.findIndex((v) => !!v.date);

      if (findIndex !== -1) {
        const date = stocks[findIndex].date as string; // YYYYMMdd
        const filePath = path.resolve(upperLimitRootPath, `${date}.json`);
        writeFile(filePath, JSON.stringify(stocks)).then(
          () => {
            resolve({ data: true });
          },
          (e) => {
            console.log(e);

            resolve({ data: false, msg: "Write file error!" });
          }
        );
      } else {
        resolve({ data: false, msg: "Can't find date of stocks!" });
      }
    });
  }

  export function getUpperLimitStocks(date?: string) {
    return new Promise<Response<StockModel[] | null>>((resolve) => {
      const latestDateStr = findExistDate(upperLimitRootPath, date, ".json");
      if (!latestDateStr) {
        resolve({ data: null, msg: `Can not find latest data of ${date}` });
        return;
      }
      const filePath = path.resolve(historyRootPath, `${latestDateStr}.json`);
      readJsonFile<StockModel[]>(filePath).then(
        (v) => {
          resolve({ data: v });
        },
        (e) => {
          resolve({ data: null, msg: e });
        }
      );
    });
  }

  export function queryUpperLimitStockSymbolByDates(dates: string[]) {
    return new Promise<Response<string[]>>((resolve, reject) => {
      IStockLadderTable.getStockLadderSymbolByDates(dates).then(
        (res) => {
          resolve({
            data: (
              res.rows as unknown as Pick<StockLadderTableModel, "symbol">[]
            ).map<string>((v) => v.symbol),
          });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      );
    });
  }
}
