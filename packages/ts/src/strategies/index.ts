import moment from "moment";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { stocksToSheetData } from "../common";
import { dbRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { StockModel } from "../models/type";
import { calculateMaxRiseDay, fillMaxRiseDay } from "../service/factors/rise";
import { Storage } from "../service/storage/storage";
import { Excel } from "../utils/excel";
import { deepCopyWithJson } from "../utils/util";
import { fitTurnover, isCross } from "./util";

export namespace Strategies {
  const logPath = path.resolve(logRootPath, "strategy.log");
  /**
   * 获取小市值的票, 按照从小到大排序
   * @returns
   */
  async function getMinCapitalStocks(minCapital = 100) {
    const allStocks: StockModel[] = await Storage.getAllStocks().then((res) => {
      return res.data;
    });

    if (!allStocks || allStocks.length <= 0) {
      logger.info(`Stocks is empty`, logPath);

      return;
    }

    const minCapitalStocks = allStocks
      .filter((v) => {
        const symbol = v.symbol;

        const isFitSymbol =
          symbol &&
          (symbol.startsWith("3") ||
            symbol.startsWith("60") ||
            symbol.startsWith("0"));
        const capital = v.capital;
        return isFitSymbol && capital && capital < minCapital;
      })
      .sort((a, b) => (a.capital as number) - (b.capital as number));

    return minCapitalStocks;
  }

  /**
   * 十字星, 五日线上方且离五日线振奋不超过 10 个点, 十日线在20日线上方, 换手率在 3~60 之间
   * @returns
   */
  export async function filterCross(minCapitalStocks?: StockModel[]) {
    if (!minCapitalStocks) {
      minCapitalStocks = await getMinCapitalStocks();
    }

    if (!minCapitalStocks || minCapitalStocks.length <= 0) {
      logger.info(`MinCapitalStocks Stocks is empty`, logPath);

      return;
    }

    const crossStocks = minCapitalStocks.filter((v) => {
      return isCross(v) && fitTurnover(v, 3, 60);
    });

    if (crossStocks.length <= 0) {
      logger.info(`crossStocks is empty`, logPath);
      return;
    }

    const filterStocks = crossStocks.filter((v) => {
      let bool = true;
      if (!v.close || !v.sma5) {
        return false;
      }
      if (v.sma5) {
        bool = v.close >= v.sma5 && (v.close - v.sma5) / v.sma5 < 0.1; // 偏离五日线 10 个点以内
      }

      if (bool && v.sma10 && v.sma20) {
        bool = v.sma10 > v.sma20;
      }

      return bool;
    });

    if (filterStocks.length <= 0) {
      logger.info(`filterStocks is empty`, logPath);
    }

    const sheets: WorkSheet[] = [
      { name: "cross", data: stocksToSheetData(filterStocks), options: {} },
    ];

    return sheets;
  }

  export async function filterMaxRiseDay(stocks: StockModel[], day = 3) {
    const filterResult = await fillMaxRiseDay(stocks);

    return filterResult.filter((v) => {
      return v.maxRiseDay && v.maxRiseDay >= day;
    });
  }

  async function fillFactor(
    stock: StockModel,
    ...fns: ((stock: StockModel, histories: StockModel[]) => StockModel)[]
  ) {
    if (!stock.symbol) {
      logger.info(`[stock.symbol] is ${stock.symbol}`, logPath);

      return stock;
    }
    if (fns.length) {
      const histories = await Storage.getStockHistories(stock.symbol).then(
        (res) => res.data as StockModel[]
      );
      if (histories && histories.length > 0) {
        let res = stock;
        fns.forEach((fn) => {
          res = fn(stock, histories);
        });
        return res;
      }
      logger.info("Storage.getStockHistories is empty", logPath);
    }
    return stock;
  }

  function getMaxTurnoverRiseDay(histories: StockModel[]) {
    if (!histories || histories.length <= 0) {
      return null;
    }
    let max = 0,
      i = 1;
    while (i < histories.length) {
      const cur = histories[i - 1].turnover;
      const pre = histories[i].turnover;
      if (cur && pre && cur > pre) {
        max++;
        i++;
      } else {
        break;
      }
    }

    return max;
  }

  /**
   * 寻找预启动的小票
   *
   * 小市值,连涨 3 天,换手率环比增大,连涨 3 天,位于五日线上方
   * @param params
   */
  export async function filterPreRise(minCapitalStocks?: StockModel[]) {
    if (!minCapitalStocks) {
      minCapitalStocks = await getMinCapitalStocks();
    }

    if (!minCapitalStocks) {
      logger.info(`Empty minCapital socks`, logPath);
      return;
    }

    const promises: Promise<StockModel>[] = [];

    minCapitalStocks.forEach(async (v) => {
      promises.push(
        fillFactor(
          v,
          (stock, histories: StockModel[]) => {
            const maxRiseDay = calculateMaxRiseDay(histories);
            if (maxRiseDay) {
              stock.maxRiseDay = maxRiseDay;
            }
            return stock;
          },
          (stock, histories: StockModel[]) => {
            const maxTurnoverRiseDay = getMaxTurnoverRiseDay(histories);
            if (maxTurnoverRiseDay) {
              stock["maxTurnoverRiseDay"] = maxTurnoverRiseDay;
            }
            return stock;
          }
        )
      );
    });

    await Promise.allSettled(promises);

    const filterRes = minCapitalStocks.filter((v) => {
      return (
        v.close &&
        v.sma5 &&
        v.close >= v.sma5 &&
        v.maxRiseDay &&
        v.maxRiseDay >= 3 &&
        v["maxTurnoverRiseDay"] &&
        (v["maxTurnoverRiseDay"] as number) >= 3
      );
    });

    const sheets: WorkSheet[] = [
      {
        name: "data",
        data: stocksToSheetData(minCapitalStocks),
        options: {},
      },
      { name: "preRise", data: stocksToSheetData(filterRes), options: {} },
    ];

    return sheets;
  }

  export async function filterStocks(cb?: (filePath?: string) => void) {
    const minCapitalStocks = await getMinCapitalStocks();

    if (!minCapitalStocks) {
      logger.info(`minCapitalStocks is empty`, logPath);
      cb?.();
      return;
    }

    const sheets: WorkSheet[] = [];
    const crossSheets = await filterCross(deepCopyWithJson(minCapitalStocks));
    if (crossSheets) {
      sheets.push(...crossSheets);
    }

    const preRiseSheet = await filterPreRise(
      deepCopyWithJson(minCapitalStocks)
    );
    if (preRiseSheet) {
      sheets.push(...preRiseSheet);
    }

    if (sheets.length <= 0) {
      logger.info(`sheets is empty`, logPath);
      cb?.();
      return;
    }
    const filePath = path.resolve(
      dbRootPath,
      `filter-${moment().format("YYYYMMDD")}.xlsx`
    );
    return Excel.write(sheets, filePath).finally(() => {
      logger.info(`Completely, ${filePath}`, logPath);
      cb?.(filePath);
    });
  }
}
