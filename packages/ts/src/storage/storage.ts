import moment from "moment";
import { StockModel } from "../common/type";
import { allStocksJsonFilePath, dateString, dbPath } from "../tasks/common";
import { access, constants, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { Response } from "./type";

export namespace Storage {
  export function getAllStocks(date?: string): Promise<Response<StockModel[]>> {
    if (!date) {
      date = dateString;
    }

    return new Promise<Response<StockModel[]>>((resolve) => {
      access(allStocksJsonFilePath, constants.F_OK).then(
        () => {
          readFile(allStocksJsonFilePath).then(
            (res) => {
              try {
                resolve({
                  data: JSON.parse(res.toString()),
                });
              } catch (error) {
                console.log(error);

                resolve({
                  data: [],
                  msg: "File data parse error!",
                });
              }
            },
            (e) => {
              console.log(e);
              resolve({
                data: [],
                msg: "Read file error!",
              });
            }
          );
        },
        (e) => {
          console.log(e);
          resolve({
            data: [],
            msg: "File do not exist!",
          });
        }
      );
    });
  }

  export function saveAllStocks(
    stocks: StockModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      if (!stocks || stocks.length <= 0) {
        resolve({ data: false, msg: "Empty list, nothing to save" });
      } else {
        access(allStocksJsonFilePath, constants.F_OK).then(
          () => {
            const filePath = allStocksJsonFilePath + moment().format("hhmmss");
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
            writeFile(allStocksJsonFilePath, JSON.stringify(stocks)).then(
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

  export function getAllStocksByDate(
    date: string
  ): Promise<Response<StockModel[]>> {
    return new Promise<Response<StockModel[]>>((resolve) => {
      const fileDir = path.resolve(dbPath, date);
      access(fileDir, constants.F_OK).then(
        () => {
          readdir(fileDir).then(
            (files: string[]) => {
              const promises: Promise<StockModel | null>[] = [];

              files.forEach((file) =>
                promises.push(
                  readFile(file).then(
                    (data) => {
                      try {
                        return JSON.parse(data.toString());
                      } catch (error) {
                        console.log(error);

                        return null;
                      }
                    },
                    (e) => {
                      console.log(e);

                      return null;
                    }
                  )
                )
              );

              Promise.all(promises).then(
                (res) => {
                  resolve({
                    data: res.filter((v) => !!v) as StockModel[],
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
}
