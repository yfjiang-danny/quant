import { writeFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { historyRootPath, upperLimitRootPath } from "../../common/paths";
import { StockModel } from "../../models/type";
import { findExistDate } from "../../utils/date";
import { readJsonFile } from "../../utils/fs";
import { Response } from "./type";
import { TushareStockModel } from "../../third/tushare/type";
import { convertToHistoryModel, convertToHistoryTimeModel } from "../utils";
import { IStockInfoTable } from "../../db/interface/stockInfo";
import { IStockSnapshotTable } from "../../db/interface/snapshot";
import {
  StockSnapshotTableModel,
  StockTimeSnapshotTableModel,
} from "../../db/tables/snapshot";
import { StockInfoTableModel } from "../../db/tables/stockInfo";
import { IStockLadderTable } from "../../db/interface/ladder";
import { StockLadderTableModel } from "../../db/tables/ladder";
import { IStockTimeSnapshotTable } from "../../db/interface/snapshot15";
import { StockFactorTableModel } from "../../db/tables/factor";
import { IStockFactorTable } from "../../db/interface/factor";
import {
  Breakthrough20StockModel,
  MaxCapitalStockModel,
} from "../../db/interface/model";
import { dbQuery } from "../../db/connect";
import { BinaryNode } from "sql";
import { StrategyTableModel } from "../../db/tables/strategy/strategy";
import { tableQuery } from "./util";
import { IStrategyTable } from "../../db/interface/strategy/strategy";
import { EastMoney_API } from "../../third/eastmoney/api";
import { MarketType } from "../../third/eastmoney/type";

export namespace Storage {
  export function queryRealtimeInfo(symbol: string, market: MarketType) {
    return EastMoney_API.queryRealtime(symbol, market);
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

  export function getStockInfoBySymbol(
    symbol: string
  ): Promise<Response<StockModel | undefined>> {
    return new Promise<Response<StockModel | undefined>>((resolve, reject) => {
      IStockInfoTable.getStockInfoBySymbol(symbol)
        .then(
          (res) => {
            if (res && res.rows) {
              resolve({ data: res.rows[0] as unknown as StockModel });
            } else {
              resolve({ data: undefined });
            }
          },
          (e) => {
            resolve({ data: undefined, msg: e });
          }
        )
        .catch((e) => {
          resolve({ data: undefined, msg: e });
        });
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

  export function getStockHistoriesFromDB(
    symbol: string,
    limit?: number,
    offset?: number,
    node?: BinaryNode | BinaryNode[]
  ): Promise<Response<StockSnapshotTableModel[]>> {
    return tableQuery(
      IStockSnapshotTable.getStocksBySymbol(symbol, limit, offset, node)
    );
  }

  export function getStockSnapshotByDate(
    date?: string
  ): Promise<Response<StockSnapshotTableModel[]>> {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return tableQuery(IStockSnapshotTable.getStocksByDate(date as string));
  }

  export function getUpLimitedStocksByDate(date?: string) {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return tableQuery<StockSnapshotTableModel>(
      IStockSnapshotTable.queryStocksUpLimitedByDate(date as string)
    );
  }

  export function getStockSnapshotBySymbolAndDate(
    symbol: string,
    date: string
  ) {
    return tableQuery<StockSnapshotTableModel>(
      IStockSnapshotTable.getStockBySymbolAndDate(symbol, date)
    );
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

  export function insertStockTimeHistories(
    type: IStockTimeSnapshotTable.TableType,
    stocks: StockModel[],
    shouldUpdate?: boolean
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve) => {
      IStockTimeSnapshotTable.insert(
        type,
        stocks.map((v) => {
          return convertToHistoryTimeModel(v);
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

  export function getStockTimeHistories(
    type: IStockTimeSnapshotTable.TableType,
    symbol: string,
    limit?: number,
    offset?: number
  ): Promise<Response<StockTimeSnapshotTableModel[]>> {
    return new Promise<Response<StockTimeSnapshotTableModel[]>>((resolve) => {
      IStockTimeSnapshotTable.getStocksBySymbol(type, symbol, limit, offset)
        .then(
          (res) => {
            resolve({
              data: res.rows as unknown as StockTimeSnapshotTableModel[],
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

  export function getStockTimeSnapshotByDate(
    type: IStockTimeSnapshotTable.TableType,
    date?: string
  ): Promise<Response<StockTimeSnapshotTableModel[]>> {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return new Promise<Response<StockTimeSnapshotTableModel[]>>((resolve) => {
      IStockTimeSnapshotTable.getStocksByDate(type, date as string)
        .then(
          (res) => {
            resolve({
              data: res.rows as unknown as StockTimeSnapshotTableModel[],
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

  export function getStockTimeDetailsByDate(
    type: IStockTimeSnapshotTable.TableType,
    date?: string
  ): Promise<Response<(StockTimeSnapshotTableModel & StockInfoTableModel)[]>> {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    return new Promise<
      Response<(StockTimeSnapshotTableModel & StockInfoTableModel)[]>
    >((resolve) => {
      IStockTimeSnapshotTable.getStockDetailsByDate(type, date as string)
        .then(
          (res) => {
            resolve({
              data: res.rows as unknown as (StockTimeSnapshotTableModel &
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

  /**
   *
   * @param dates 获取涨停股
   * @returns
   */
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

  export function insertUpperLimitStocks(
    stocks: StockLadderTableModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve, reject) => {
      IStockLadderTable.insert(stocks)
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

  export function insertFactors(
    stocks: StockFactorTableModel[]
  ): Promise<Response<boolean>> {
    return new Promise<Response<boolean>>((resolve, reject) => {
      IStockFactorTable.insert(stocks)
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

  export function queryFactorBySymbolAndDate(symbol: string, date: string) {
    return new Promise<Response<StockFactorTableModel[]>>((resolve, reject) => {
      IStockFactorTable.queryStockFactorBySymbolAndDate(symbol, date).then(
        (res) => {
          resolve({
            data: res.rows as unknown as StockFactorTableModel[],
          });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      );
    });
  }

  export function queryStocksByDateAndMaxCapital(
    date: string,
    maxCapital: number
  ) {
    return new Promise<Response<MaxCapitalStockModel[]>>((resolve, reject) => {
      IStockFactorTable.queryStocksByDateAndMaxCapital(date, maxCapital).then(
        (res) => {
          resolve({
            data: res.rows as unknown as MaxCapitalStockModel[],
          });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      );
    });
  }

  export function queryBreakthrough20StocksByDateAndMaxCapital(
    date: string,
    maxCapital: number
  ) {
    return new Promise<Response<Breakthrough20StockModel[]>>(
      (resolve, reject) => {
        IStockFactorTable.queryBreakthrough20StocksByDateAndMaxCapital(
          date,
          maxCapital
        ).then(
          (res) => {
            resolve({
              data: res.rows as unknown as Breakthrough20StockModel[],
            });
          },
          (e) => {
            resolve({ data: [], msg: e });
          }
        );
      }
    );
  }

  export function insertStrategy(strategy: Omit<StrategyTableModel, "id">) {
    return tableQuery(IStrategyTable.insert(strategy));
  }
}
