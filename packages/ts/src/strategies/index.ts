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
import {
  getCurrentDateAndTime,
  getLatestTradeDates,
  toDashDate,
} from "../utils/date";
import { MaxCapitalStockModel } from "../db/interface/model";
import { SimulationStorage } from "../service/storage/simulation/storage";
import { PlanTable, PlanTableModel } from "../db/tables/simulation/plan";
import { getMarket } from "../utils/convert";
import {
  EntrustmentStatus,
  EntrustmentTable,
  EntrustmentTableModel,
} from "../db/tables/simulation/entrustment";
import { QueryLike } from "sql";
import { IAccountTable } from "../db/interface/simulation/account";
import {
  AccountTable,
  AccountTableModel,
} from "../db/tables/simulation/account";
import { dbQuery } from "../db/connect";
import { DealTable, DealTableModel } from "../db/tables/simulation/deal";
import {
  HoldingTable,
  HoldingTableModel,
} from "../db/tables/simulation/holding";
import { genID } from "../utils/id";
import { precision } from "../utils/number";

export namespace Strategies {
  const logPath = path.resolve(logRootPath, "strategy.log");

  function log(msg: unknown) {
    logger.info(msg, logPath);
  }

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
          return res.data.map((v) => {
            return {
              ...v,
              close: v.close_number,
              sma20: v.sma20_number,
              turnover: v.turnover_number,
            } as unknown as StockModel;
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
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const buyPlans = await SimulationStorage.queryBuyPlansByAccountIDAndDate(
      account.account_id,
      date
    ).then((res) => res.data);

    if (!Array.isArray(buyPlans) || buyPlans.length == 0) {
      log(`There are no buy plans!`);
      return;
    }

    const promises: Promise<GenBuyEntrustmentResponse>[] = [];
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
        log(`Exec buyTask success`);
      })
      .catch((e) => {
        log(`Exec buyTask failed: ${e}`);
      });
  }

  interface GenBuyEntrustmentResponse {
    plan?: PlanTableModel;
    entrustment?: EntrustmentTableModel;
  }
  function genBuyEntrustmentByPlan(plan: PlanTableModel) {
    return new Promise<GenBuyEntrustmentResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(plan.symbol, getMarket(plan.symbol))
        .then((res) => {
          if (!res || !res.close) {
            resolve({ plan });
            return;
          }
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
            status: 0,
          };

          resolve({ entrustment });
        })
        .catch((e) => {
          resolve({ plan });
        });
    });
  }

  export async function buyEntrustmentTask(date?: string) {
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName("20日线");

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const buyEntrustments =
      await SimulationStorage.queryBuyEntrustmentsByAccountIDAndDate(
        account.account_id,
        date
      ).then((res) => res.data);

    if (!Array.isArray(buyEntrustments) || buyEntrustments.length == 0) {
      log(`There are no buy entrustments!`);
      return;
    }

    const promises: Promise<CheckBuyEntrustmentIsDoneResponse>[] = [];
    buyEntrustments.forEach((p) => promises.push(checkBuyEntrustmentIsDone(p)));

    const undoneEntrustment: EntrustmentTableModel[] = [];
    const doneEntrustments: (EntrustmentTableModel & { deal_price: number })[] =
      [];
    await Promise.allSettled(promises).then((res) => {
      res.forEach((v, i) => {
        if (v.status === "fulfilled") {
          if (v.value.status === 1) {
            doneEntrustments.push({
              ...buyEntrustments[i],
              deal_price: v.value.price!,
            });
          } else {
            undoneEntrustment.push({
              ...buyEntrustments[i],
              status: v.value.status,
            });
          }
        }
      });
    });

    const deals: DealTableModel[] = [];
    const holdings: HoldingTableModel[] = [];
    const newAccount = { ...account };

    doneEntrustments.forEach((v) => {
      const dealAmount = precision(v.count * v.deal_price);
      const fee = calcFee(dealAmount, 0);
      const dealId = genID();
      deals.push({
        symbol: v.symbol,
        account_id: newAccount.account_id,
        amount: dealAmount,
        count: v.count,
        deal_date: v.date,
        deal_id: dealId,
        deal_type: 0,
        fee,
        price: v.deal_price,
      });

      const interestRate = precision(fee / dealAmount);

      holdings.push({
        symbol: v.symbol,
        account_id: newAccount.account_id,
        amount: dealAmount,
        count: v.count,
        buy_price: v.deal_price,
        cur_price: v.deal_price,
        deal_ids: dealId,
        interest: -fee,
        interest_rate: -interestRate,
      });

      newAccount.available -= dealAmount + fee;
      newAccount.holding += dealAmount;
    });

    newAccount.available = precision(newAccount.available);
    newAccount.holding = precision(newAccount.holding);
    newAccount.amount = precision(newAccount.holding + newAccount.available);
    newAccount.interest = precision(newAccount.amount - newAccount.init_amount);
    newAccount.interest_rate = precision(
      newAccount.interest / newAccount.init_amount
    );

    const querys: QueryLike[] = [];

    undoneEntrustment.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          updateAt: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });
    doneEntrustments.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          updateAt: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });

    deals.forEach((v) => {
      querys.push(
        DealTable.insert({
          ...v,
          createAt: getCurrentDateAndTime(),
          updateAt: getCurrentDateAndTime(),
        }).toQuery()
      );
    });

    holdings.forEach((v) => {
      querys.push(
        HoldingTable.insert({
          ...v,
          createAt: getCurrentDateAndTime(),
          updateAt: getCurrentDateAndTime(),
        }).toQuery()
      );
    });

    querys.unshift(AccountTable.update(account).toQuery());

    await dbQuery(querys)
      .then(() => {
        log(`Exec buyEntrustmentsTask success`);
      })
      .catch((e) => {
        log(`Exec buyEntrustmentsTask failed: ${e}`);
      });
  }

  interface CheckBuyEntrustmentIsDoneResponse {
    status: EntrustmentStatus;
    price?: number;
  }

  function checkBuyEntrustmentIsDone(data: EntrustmentTableModel) {
    return new Promise<CheckBuyEntrustmentIsDoneResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(data.symbol, getMarket(data.symbol))
        .then((res) => {
          if (!res || !res.open) {
            // Unknow status
            resolve({ status: 3 });
            return;
          }

          if (res.open > data.price) {
            // Can not make a deal
            resolve({ status: 2 });
            return;
          }

          resolve({
            status: 1,
            price: res.open,
          });
        })
        .catch((e) => {
          resolve({ status: 3 });
        });
    });
  }
}
