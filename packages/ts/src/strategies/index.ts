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
import { calcFee, deepCopyWithJson } from "../utils/util";
import {
  fitTurnover,
  isBreakthrough20,
  isCross,
  isDownCross,
  isDownCrossMoreThanUpCross,
} from "./util";
import { StockSnapshotTableModel } from "../db/tables/snapshot";
import { fillStocksSMA } from "../service/factors/sma";
import { getLatestTradeDates, toDashDate } from "../utils/date";
import { MaxCapitalStockModel } from "../db/interface/model";
import { SimulationStorage } from "../service/storage/simulation/storage";
import { PlanTable, PlanTableModel } from "../db/tables/simulation/plan";
import { getMarket } from "../utils/convert";
import {
  EntrustmentTable,
  EntrustmentTableModel,
} from "../db/tables/simulation/entrustment";
import { QueryLike } from "sql";
import { IAccountTable } from "../db/interface/simulation/account";
import { AccountTable } from "../db/tables/simulation/account";
import { dbQuery } from "../db/connect";

export namespace Strategies {
  const logPath = path.resolve(logRootPath, "strategy.log");
  /**
   * 获取小市值的票, 按照从小到大排序
   * @returns
   */
  export async function getMinCapitalStocks(minCapital = 100, date?: string) {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }

    const allStocks: MaxCapitalStockModel[] =
      await Storage.queryStocksByDateAndMaxCapital(date, minCapital).then(
        (res) => {
          return res.data;
        }
      );

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
        nv.capital = v.flow_capital_number;
        return nv as StockModel;
      })
      .filter((v) => {
        const symbol = v.symbol;

        const isFitSymbol =
          symbol &&
          (symbol.startsWith("3") ||
            symbol.startsWith("60") ||
            symbol.startsWith("0"));
        return isFitSymbol;
      });

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
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const breakthrough20Stocks =
      await Storage.queryBreakthrough20StocksByDateAndMaxCapital(
        date,
        200
      ).then((res) => {
        if (res) {
          return res.data
            .map((v) => {
              return {
                ...v,
                close: v.close_number,
                sma20: v.sma20_number,
                turnover: v.turnover_number,
              } as unknown as StockModel;
            })
            .filter((a) => {
              const symbol = a.symbol;

              const isFitSymbol =
                symbol &&
                (symbol.startsWith("3") ||
                  symbol.startsWith("60") ||
                  symbol.startsWith("0"));
              return isFitSymbol;
            });
        }
        return [];
      });

    if (!breakthrough20Stocks || breakthrough20Stocks.length == 0) {
      logger.info(`breakthrough20Stocks is empty`, logPath);
      return;
    }

    const dates = getLatestTradeDates(10, date);
    const upperLimitStocks = await Storage.queryUpperLimitStockSymbolByDates(
      dates
    ).then((res) => res.data);

    const smaStocks = breakthrough20Stocks.filter(
      (v) =>
        (!v.name || (v.name && !v.name.toUpperCase().includes("ST"))) &&
        v.symbol &&
        upperLimitStocks.includes(v.symbol)
    );

    const resStocks = smaStocks.filter((v) => isDownCrossMoreThanUpCross(v));

    return resStocks;
  }

  /**
   * 获取涨停
   * @param stocks
   * @returns
   */
  export function getUpperLimitStocks(stocks: StockModel[]): StockModel[] {
    return stocks.filter((v) => v.close === v.topPrice);
  }

  export async function buyTask(date?: string) {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName("20日线");

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      logger.info(`20日线 do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const buyPlans = await SimulationStorage.queryBuyPlansByAccountIDAndDate(
      account.account_id,
      date
    ).then((res) => res.data);

    if (!Array.isArray(buyPlans) || buyPlans.length == 0) {
      logger.info(`There are no buy plans!`);
      return;
    }

    const promises: Promise<GenEntrustmentResponse>[] = [];
    buyPlans.forEach((p) => promises.push(genBuyEntrustmentByPlan(p)));

    const invalidPlans: PlanTableModel[] = [];
    const entrustments: EntrustmentTableModel[] = [];
    await Promise.allSettled(promises).then((res) => {
      res.forEach((v) => {
        if (v.status === "fulfilled") {
          v.value.plan && invalidPlans.push(v.value.plan);
          v.value.entrustment && entrustments.push(v.value.entrustment);
        }
      });
    });

    const querys: QueryLike[] = [];

    entrustments.forEach((v) => {
      account.available -= v.amount;
      querys.push(EntrustmentTable.insert(v).toQuery());
    });

    querys.unshift(AccountTable.update(account).toQuery());

    buyPlans.forEach((v) => {
      querys.push(PlanTable.update({ ...v, exec_flag: 1 }).toQuery());
    });

    await dbQuery(querys)
      .then(() => {
        logger.info(`Exec buyTask success`);
      })
      .catch((e) => {
        logger.info(`Exec buyTask failed: ${e}`);
      });
  }

  interface GenEntrustmentResponse {
    plan?: PlanTableModel;
    entrustment?: EntrustmentTableModel;
  }
  function genBuyEntrustmentByPlan(plan: PlanTableModel) {
    return new Promise<GenEntrustmentResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(plan.symbol, getMarket(plan.symbol))
        .then((res) => {
          if (!res || !res.close) {
            resolve({ plan });
          } else {
            const buyPrice = Number((res.close * 1.05).toFixed(2));

            let count = Math.floor(plan.plan_amount / buyPrice / 100) * 100;

            let amount = count * buyPrice;

            let fee = calcFee(amount, 0);

            while (fee + amount > plan.plan_amount) {
              count -= 100;
              if (count <= 0) {
                break;
              }
              amount = count * buyPrice;
              fee = calcFee(amount, 0);
            }

            if (count <= 0) {
              resolve({ plan });
              return;
            }

            const dateTimeString = Date.now().toString();
            const entrustment: EntrustmentTableModel = {
              account_id: plan.account_id,
              symbol: plan.symbol,
              amount: amount,
              count,
              date: plan.date,
              deal_type: 0,
              id: dateTimeString.slice(dateTimeString.length - 10),
              price: buyPrice,
              time: moment().format("HH:mm:ss"),
            };

            resolve({ entrustment });
          }
        })
        .catch((e) => {
          resolve({ plan });
        });
    });
  }
}
