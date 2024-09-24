import moment from "moment";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { stocksToSheetData } from "../common";
import { filterRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { StockModel } from "../models/type";
import { calculateMaxRiseDay, fillMaxRiseDay } from "../service/factors/rise";
import { Storage } from "../service/storage/storage";
import { Excel } from "../utils/excel";
import { deepCopyWithJson } from "../utils/util";
import { fitTurnover, isCross, isDownCross } from "./util";
import { StockSnapshotTableModel } from "../db/tables/snapshot";
import { fillStocksSMA } from "../service/factors/sma";
import { getLatestTradeDates } from "../utils/date";

export namespace Strategies {
  const logPath = path.resolve(logRootPath, "strategy.log");
  /**
   * 获取小市值的票, 按照从小到大排序
   * @returns
   */
  export async function getMinCapitalStocks(minCapital = 100, date?: string) {
    const allStocks: StockSnapshotTableModel[] =
      await Storage.getStockDetailsByDate(date).then((res) => {
        return res.data;
      });

    if (!allStocks || allStocks.length <= 0) {
      logger.info(`Stocks is empty`, logPath);

      return;
    }

    const minCapitalStocks = allStocks
      .map((v) => {
        const nv: Record<string, unknown> = { ...v };
        Object.keys(nv).forEach((key) => {
          if (!isNaN(Number(nv[key])) && key !== "symbol" && key !== "date") {
            nv[key] = Number(nv[key]);
          }
        });
        nv.capital =
          ((Number(v.volume) / (Number(v.turnover) / 100)) * Number(v.close)) /
          Math.pow(10, 6);
        return nv as StockModel;
      })
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
   * 十字星, 五日线上方且离五日线振幅不超过 10 个点, 十日线在20日线上方, 换手率在 3~60 之间
   * @returns
   */
  export async function filterCross(minCapitalStocks?: StockModel[]) {
    if (!minCapitalStocks) {
      minCapitalStocks = await getMinCapitalStocks(300);
    }

    if (!minCapitalStocks || minCapitalStocks.length <= 0) {
      logger.info(`MinCapitalStocks Stocks is empty`, logPath);

      return;
    }

    const crossStocks = minCapitalStocks.filter((v) => {
      return isDownCross(v) && fitTurnover(v, 3, 60);
    });

    if (crossStocks.length <= 0) {
      logger.info(`crossStocks is empty`, logPath);
      return;
    }

    const filterStocks = crossStocks.filter((v) => {
      let bool = true;
      const close = Number(v.close);
      if (!close || !v.sma5) {
        return false;
      }
      if (v.sma5) {
        bool = close >= v.sma5 && (close - v.sma5) / v.sma5 < 0.1; // 偏离五日线 10 个点以内
      }

      if (bool && v.sma10 && v.sma20) {
        bool = v.sma10 > v.sma20;
      }

      return bool;
    });

    if (filterStocks.length <= 0) {
      logger.info(`filterCross -> filterStocks is empty`, logPath);
      return;
    }

    return filterStocks;
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
      const histories = await Storage.getStockHistoriesFromDB(
        stock.symbol,
        120
      ).then((res) => res.data as unknown as StockModel[]);
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
      const cur = Number(histories[i - 1].turnover);
      const pre = Number(histories[i].turnover);
      if (!isNaN(cur) && !isNaN(pre) && cur > pre) {
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
   * 小市值,连涨 3 天,换手率环比增大,连涨 3 天,位于五日线上方,离 5 日线 10 个点内
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
      const close = Number(v.close);
      return (
        close &&
        v.sma5 &&
        close >= v.sma5 &&
        (close - v.sma5) / v.sma5 < 0.1 &&
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

  export async function filterStocks(
    cb?: (filePath?: string) => void,
    date?: string
  ) {
    const minCapitalStocks = await getMinCapitalStocks(500, date);

    if (!minCapitalStocks) {
      logger.info(`minCapitalStocks is empty`, logPath);
      return;
    }

    const dates = getLatestTradeDates(5);
    const upperLimitStocks = await Storage.queryUpperLimitStockSymbolByDates(
      dates
    ).then((res) => res.data);

    const smaStocks = await fillStocksSMA(
      minCapitalStocks.filter(
        (v) =>
          (!v.name || (v.name && !v.name.toUpperCase().includes("ST"))) &&
          v.symbol &&
          upperLimitStocks.includes(v.symbol)
      )
    );

    return smaStocks.filter((v) => {
      if (!v.open || !v.close) return false;

      if (!isDownCross(v) || !fitTurnover(v, 3, 60)) return false;

      return (
        (v.sma5 &&
          ((v.open > v.sma5 && v.close < v.sma5) ||
            (v.close > v.sma5 && v.open < v.sma5))) ||
        (v.sma10 &&
          ((v.open > v.sma10 && v.close < v.sma10) ||
            (v.close > v.sma10 && v.open < v.sma10))) ||
        (v.sma20 &&
          ((v.open > v.sma20 && v.close < v.sma20) ||
            (v.close > v.sma20 && v.open < v.sma20)))
      );
    });
  }

  /**
   * 获取涨停
   * @param stocks
   * @returns
   */
  export function getUpperLimitStocks(stocks: StockModel[]): StockModel[] {
    return stocks.filter((v) => v.close === v.topPrice);
  }
}
