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
import { batchTask, calcFee, deepCopyWithJson } from "../utils/util";
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
  getCurrentDate,
  getCurrentDateAndTime,
  getLatestTradeDates,
  getNextTradeDate,
  getRangeTradeDates,
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
  HoldingHistoryTable,
  HoldingHistoryTableModel,
  HoldingTable,
  HoldingTableModel,
} from "../db/tables/simulation/holding";
import { genID } from "../utils/id";
import { precision } from "../utils/number";
import { EastMoneyStockModel } from "../third/eastmoney/type";
import { isHoliday } from "chinese-calendar-ts";
import pLimit from "p-limit";
import {
  BackTestingDealModel,
  BackTestingHoldingHistoryModel,
  BackTestingHoldingModel,
} from "./type";
import { promiseSettled } from "../utils/promise";

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

  export async function buyTask(date?: string, accountName = "20日线") {
    log("Exec buyTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

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

    const promises: Promise<GenEntrustmentResponse>[] = [];
    buyPlans.forEach((p) => promises.push(genBuyEntrustmentByPlan(p)));

    const entrustments: EntrustmentTableModel[] = [];
    await Promise.allSettled(promises).then((res) => {
      res.forEach((v, i) => {
        if (v.status === "fulfilled") {
          v.value.errorMsg && (buyPlans[i].mark = v.value.errorMsg);
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

  interface GenEntrustmentResponse {
    errorMsg?: string;
    entrustment?: EntrustmentTableModel;
  }
  function genBuyEntrustmentByPlan(plan: PlanTableModel) {
    return new Promise<GenEntrustmentResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(plan.symbol, getMarket(plan.symbol))
        .then((res) => {
          if (!res) {
            resolve({ errorMsg: "queryRealtimeInfo error" });
            return;
          }
          if (!res.close) {
            resolve({ errorMsg: "queryRealtimeInfo close is null" });
            return;
          }
          if (!plan.plan_amount) {
            resolve({ errorMsg: "plan plan_amount is null" });
            return;
          }
          const buyPrice = Number(
            Math.min((res.close * 1.01, res.topPrice || 10000)).toFixed(2)
          );

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
            resolve({ errorMsg: "Calculate count is 0" });
            return;
          }

          const entrustment: EntrustmentTableModel = {
            account_id: plan.account_id,
            symbol: plan.symbol,
            amount: amount,
            count,
            date: plan.date,
            deal_type: 0,
            id: genID(),
            price: buyPrice,
            time: moment().format("HH:mm:ss"),
            status: 0,
          };

          resolve({ entrustment });
        })
        .catch((e) => {
          resolve({ errorMsg: "queryRealtimeInfo error" });
        });
    });
  }

  export async function buyEntrustmentTask(
    date?: string,
    accountName = "20日线"
  ) {
    log("Exec buyEntrustmentTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

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

    const promises: Promise<CheckEntrustmentIsDoneResponse>[] = [];
    buyEntrustments.forEach((p) => promises.push(checkBuyEntrustmentIsDone(p)));

    const undoneEntrustments: EntrustmentTableModel[] = [];
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
            undoneEntrustments.push({
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
      const cost = fee + dealAmount;
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

      const interestRate = precision((fee * 100) / cost);

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
        buy_date: v.date,
        fee: fee,
      });

      newAccount.available -= dealAmount + fee;
      newAccount.holding += dealAmount;
    });

    newAccount.available = precision(newAccount.available);
    newAccount.holding = precision(newAccount.holding);
    newAccount.amount = precision(newAccount.holding + newAccount.available);
    newAccount.interest = precision(newAccount.amount - newAccount.init_amount);
    newAccount.interest_rate = precision(
      (newAccount.interest * 100) / newAccount.init_amount
    );

    const querys: QueryLike[] = [];

    undoneEntrustments.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          update_at: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });
    doneEntrustments.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          update_at: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });

    deals.forEach((v) => {
      querys.push(
        DealTable.insert({
          ...v,
          create_at: getCurrentDateAndTime(),
          update_at: getCurrentDateAndTime(),
        }).toQuery()
      );
    });

    holdings.forEach((v) => {
      querys.push(
        HoldingTable.insert({
          ...v,
          create_at: getCurrentDateAndTime(),
          update_at: getCurrentDateAndTime(),
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

  interface CheckEntrustmentIsDoneResponse {
    status: EntrustmentStatus;
    price?: number;
  }

  function checkBuyEntrustmentIsDone(data: EntrustmentTableModel) {
    return new Promise<CheckEntrustmentIsDoneResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(data.symbol, getMarket(data.symbol))
        .then((res) => {
          if (!res || !res.open) {
            // Unknow status
            resolve({ status: 3 });
            return;
          }

          if (res.topPrice == res.close) {
            // Can not make a deal
            resolve({ status: 2 });
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

  export async function sellPlanTask(date?: string, accountName = "20日线") {
    log("Exec buyTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const sellPlans = await SimulationStorage.querySellPlansByAccountIDAndDate(
      account.account_id,
      date
    ).then((res) => res.data);

    if (!Array.isArray(sellPlans) || sellPlans.length == 0) {
      log(`There are no sell plans!`);
      return;
    }

    const promises: Promise<GenEntrustmentResponse>[] = [];
    sellPlans.forEach((p) => promises.push(genSellEntrustment(p)));

    const entrustments: EntrustmentTableModel[] = [];
    await Promise.allSettled(promises).then((res) => {
      res.forEach((v, i) => {
        if (v.status === "fulfilled") {
          v.value.errorMsg && (sellPlans[i].mark = v.value.errorMsg);
          v.value.entrustment && entrustments.push(v.value.entrustment);
        }
      });
    });

    const querys: QueryLike[] = [];

    entrustments.forEach((v) => {
      querys.push(EntrustmentTable.insert(v).toQuery());
    });

    sellPlans.forEach((v) => {
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

  function genSellEntrustment(plan: PlanTableModel) {
    return new Promise<GenEntrustmentResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(plan.symbol, getMarket(plan.symbol))
        .then((res) => {
          if (!res) {
            resolve({ errorMsg: "queryRealtimeInfo error" });
            return;
          }
          if (!res.close || !res.open) {
            resolve({ errorMsg: "queryRealtimeInfo close or open is null" });
            return;
          }

          if (!res.bottomPrice) {
            resolve({ errorMsg: "queryRealtimeInfo bottomPrice is null" });
            return;
          }

          if (res.bottomPrice == res.close) {
            resolve({
              errorMsg: "queryRealtimeInfo bottomPrice == close",
            });
            return;
          }

          if (!plan.plan_count) {
            resolve({
              errorMsg: "Plan plan_count is null",
            });
            return;
          }

          const entrustment: EntrustmentTableModel = {
            account_id: plan.account_id,
            symbol: plan.symbol,
            amount: 0,
            count: plan.plan_count,
            date: plan.date,
            deal_type: 1,
            id: genID(),
            price: res.bottomPrice,
            time: moment().format("HH:mm:ss"),
            status: 0,
          };

          resolve({ entrustment });
        })
        .catch((e) => {
          resolve({ errorMsg: "queryRealtimeInfo error" });
        });
    });
  }

  export async function sellEntrustmentTask(
    date?: string,
    accountName = "20日线"
  ) {
    log("Exec sellEntrustmentTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const sellEntrustments =
      await SimulationStorage.querySellEntrustmentsByAccountIDAndDate(
        account.account_id,
        date
      ).then((res) => res.data);

    if (!Array.isArray(sellEntrustments) || sellEntrustments.length == 0) {
      log(`There are no sell entrustments!`);
      return;
    }

    const promises: Promise<CheckEntrustmentIsDoneResponse>[] = [];
    sellEntrustments.forEach((p) =>
      promises.push(checkSellEntrustmentIsDone(p))
    );

    const undoneEntrustments: EntrustmentTableModel[] = [];
    const doneEntrustments: (EntrustmentTableModel & { deal_price: number })[] =
      [];
    await Promise.allSettled(promises).then((res) => {
      res.forEach((v, i) => {
        if (v.status === "fulfilled") {
          if (v.value.status === 1) {
            doneEntrustments.push({
              ...sellEntrustments[i],
              deal_price: v.value.price!,
            });
          } else {
            undoneEntrustments.push({
              ...sellEntrustments[i],
              status: v.value.status,
            });
          }
        }
      });
    });

    const querys: QueryLike[] = [];

    const newAccount = { ...account };

    const deals: DealTableModel[] = [];
    const holdingHistories: HoldingHistoryTableModel[] = [];
    let holdings: HoldingTableModel[] = [];

    if (doneEntrustments.length > 0) {
      holdings = await SimulationStorage.queryAccountHoldingsBySymbols(
        newAccount.account_id,
        doneEntrustments.map((v) => v.symbol)
      ).then((res) => res.data);

      doneEntrustments.forEach((v) => {
        const dealAmount = precision(v.count * v.deal_price);
        const fee = calcFee(dealAmount, 1);
        const dealId = genID();
        deals.push({
          symbol: v.symbol,
          account_id: newAccount.account_id,
          amount: dealAmount,
          count: v.count,
          deal_date: v.date,
          deal_id: dealId,
          deal_type: 1,
          fee,
          price: v.deal_price,
        });

        const findHolding = holdings.find((h) => h.symbol === v.symbol);

        if (findHolding) {
          const interest = precision(
            (v.deal_price - findHolding.buy_price) * v.count -
              findHolding.fee -
              fee
          );
          const interestRate = precision(
            (interest * 100) /
              (findHolding.buy_price * findHolding.count + findHolding.fee)
          );
          holdingHistories.push({
            id: genID(),
            account_id: newAccount.account_id,
            buy_date: findHolding.buy_date,
            buy_price: findHolding.buy_price,
            count: findHolding.count,
            sell_price: v.deal_price,
            sell_date: v.date,
            symbol: v.symbol,
            interest: interest,
            interest_rate: interestRate,
            deal_ids: findHolding.deal_ids + `,${dealId}`,
            create_at: getCurrentDateAndTime(),
            update_at: getCurrentDateAndTime(),
          });
          newAccount.available += dealAmount - fee;
          newAccount.holding -= dealAmount;
        }
      });
    }

    newAccount.available = precision(newAccount.available);
    newAccount.holding = precision(newAccount.holding);
    newAccount.amount = precision(newAccount.holding + newAccount.available);
    newAccount.interest = precision(newAccount.amount - newAccount.init_amount);
    newAccount.interest_rate = precision(
      (newAccount.interest * 100) / newAccount.init_amount
    );

    undoneEntrustments.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          update_at: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });
    doneEntrustments.forEach((v) => {
      querys.push(
        EntrustmentTable.update({
          status: v.status,
          update_at: getCurrentDateAndTime(),
        })
          .where(EntrustmentTable.id.equals(v.id))
          .toQuery()
      );
    });

    // insert deals
    deals.forEach((v) => {
      querys.push(
        DealTable.insert({
          ...v,
          create_at: getCurrentDateAndTime(),
          update_at: getCurrentDateAndTime(),
        }).toQuery()
      );
    });

    // insert holding history
    holdingHistories.forEach((v) => {
      querys.push(
        HoldingHistoryTable.insert({
          ...v,
          create_at: getCurrentDateAndTime(),
          update_at: getCurrentDateAndTime(),
        }).toQuery()
      );
    });

    // delete holding
    holdings.forEach((v) => {
      querys.push(
        HoldingTable.delete()
          .where(HoldingTable.account_id.equals(v.account_id))
          .where(HoldingTable.symbol.equals(v.symbol))
          .toQuery()
      );
    });

    // update account
    querys.unshift(AccountTable.update(account).toQuery());

    await dbQuery(querys)
      .then(() => {
        log(`Exec sellEntrustmentsTask success`);
      })
      .catch((e) => {
        log(`Exec sellEntrustmentsTask failed: ${e}`);
      });
  }

  function checkSellEntrustmentIsDone(data: EntrustmentTableModel) {
    return new Promise<CheckEntrustmentIsDoneResponse>((resolve, reject) => {
      Storage.queryRealtimeInfo(data.symbol, getMarket(data.symbol))
        .then((res) => {
          if (!res || !res.close) {
            // Unknow status
            resolve({ status: 3 });
            return;
          }

          if (res.close == res.bottomPrice) {
            // Can not make a deal
            resolve({ status: 2 });
            return;
          }

          if (res.close < data.price) {
            // Can not make a deal
            resolve({ status: 2 });
            return;
          }

          resolve({
            status: 1,
            price: res.close,
          });
        })
        .catch((e) => {
          resolve({ status: 3 });
        });
    });
  }

  export async function clearingTask(date?: string, accountName = "20日线") {
    log("Exec clearingTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const holdings = await SimulationStorage.queryHoldingsByAccoundID(
      account.account_id
    ).then((res) => res.data);

    const querys: QueryLike[] = [];

    if (holdings && holdings.length) {
      const promises: Promise<EastMoneyStockModel | null>[] = [];

      holdings.forEach((v) => {
        promises.push(Storage.queryRealtimeInfo(v.symbol, getMarket(v.symbol)));
      });

      const resArr = await Promise.allSettled(promises);

      let holdingAmount = 0;

      resArr.forEach((v, i) => {
        const h = holdings[i];
        if (v.status === "fulfilled") {
          if (v.value && v.value.close) {
            h.cur_price = precision(v.value.close);
            h.amount = precision(v.value.close * h.count);
            const interest = precision(
              (v.value.close - h.buy_price) * h.count - h.fee
            );
            const interestRate = precision(
              (interest * 100) / (h.buy_price * h.count + h.fee)
            );
            h.interest = interest;
            h.interest_rate = interestRate;
            h.update_at = getCurrentDateAndTime();

            querys.push(HoldingTable.update(h).toQuery());
          }
        }
        holdingAmount += h.amount;
      });

      account.holding = precision(holdingAmount);
      account.amount = precision(account.holding + account.available);
      account.interest = precision(account.amount - account.init_amount);
      account.interest_rate = precision(
        (account.interest * 100) / account.init_amount
      );
      account.date = moment().format("YYYYMMDD");
      account.time = moment().format("HH:mm:ss");
      account.update_at = getCurrentDateAndTime();

      querys.push(AccountTable.update(account).toQuery());
    }

    if (querys.length > 0) {
      dbQuery(querys)
        .then(() => {
          log(`Exec clearingTask success`);
        })
        .catch((e) => {
          log(`Exec clearingTask failed: ${e}`);
        });
    }
  }

  export async function genPlanTask(date?: string, accountName = "20日线") {
    log("Exec clearingTask");
    if (!date) {
      date = moment().format("YYYYMMDD");
    }
    const accountRes = await SimulationStorage.queryAccountByName(accountName);

    if (!accountRes || !accountRes.data || accountRes.data.length == 0) {
      log(`Account(20日线) do not exist!`);
      return;
    }

    const account = accountRes.data[0];

    const strategyRes = await SimulationStorage.queryStrategyByNameAndDate(
      "突破20日线",
      date
    ).then((res) => res.data);

    if (!strategyRes || strategyRes.length == 0) {
      log(`Strategy(20日线) do not exist!`);
      return;
    }

    const strategy = strategyRes[0];

    if (!strategy.content) {
      log(`Strategy(20日线) content is null!`);
      return;
    }

    let symbols = strategy.content.split(",");
    if (symbols.length == 0) {
      log(`Strategy(20日线) symbols is null!`);
      return;
    }

    const holdings = await SimulationStorage.queryHoldingsByAccoundID(
      account.account_id
    ).then((res) => res.data);

    const len = 5 - (holdings?.length || 0);

    if (holdings) {
      symbols = symbols.slice(0, len);
    }

    const querys: QueryLike[] = [];

    if (symbols.length >= 0) {
      log(`Strategy(20日线) symbols - holding is 0!`);

      const avgAmount = precision(account.available / len);
      symbols.forEach((v) => {
        querys.push(
          PlanTable.insert({
            account_id: account.account_id,
            date: getNextTradeDate(date),
            deal_type: 0,
            exec_flag: 0,
            plan_id: genID(),
            symbol: v,
            create_at: getCurrentDateAndTime(),
            update_at: getCurrentDateAndTime(),
            plan_amount: avgAmount,
          }).toQuery()
        );
      });
    }

    holdings.forEach((v) => {
      querys.push(
        PlanTable.insert({
          account_id: account.account_id,
          date: getNextTradeDate(date),
          deal_type: 1,
          exec_flag: 0,
          plan_id: genID(),
          symbol: v.symbol,
          create_at: getCurrentDateAndTime(),
          update_at: getCurrentDateAndTime(),
          plan_count: v.count,
        }).toQuery()
      );
    });

    dbQuery(querys)
      .then(() => {
        log(`Exec genPlanTask success`);
      })
      .catch((e) => {
        log(`Exec genPlanTask failed: ${e}`);
      });
  }

  export async function backTesting20(start = "20240109", end?: string) {
    if (!end) {
      end = moment().format("YYYYMMDD");
    }

    const dates = getRangeTradeDates(start, end);

    const stocksMap: Record<string, StockModel[]> = await getFilterStockMap(
      dates
    );

    const initial = 200000;
    const account: Pick<
      AccountTableModel,
      | "amount"
      | "holding"
      | "available"
      | "date"
      | "init_amount"
      | "interest"
      | "interest_rate"
    > = {
      init_amount: initial,
      amount: initial,
      holding: 0,
      available: initial,
      date: getCurrentDate(),
      interest: 0,
      interest_rate: 0,
    };

    const holdingMap: Record<string, BackTestingHoldingModel[]> = {};

    const holdingHistories: BackTestingHoldingHistoryModel[] = [];
    const deals: BackTestingDealModel[] = [];

    let i = 1;
    while (i < dates.length) {
      const curDateStr = dates[i];
      const preDateStr = dates[i - 1];

      i++;

      const newHoldings: BackTestingHoldingModel[] = [];

      let holdingLen = 0;

      const preHolding = holdingMap[preDateStr];
      if (preHolding) {
        holdingLen = preHolding.length;
      }

      let planStocks = stocksMap[preDateStr];

      if (planStocks && planStocks.length > 0) {
        const availableLen = 5 - holdingLen;
        planStocks = planStocks.slice(0, availableLen);

        if (planStocks.length > 0) {
          const planAmount = account.available / availableLen;

          await promiseSettled(planStocks, (ps) =>
            backTestingBuyStock(ps.symbol!, ps.date!, planAmount)
          ).then((res) => {
            res.forEach((v, i) => {
              if (v.status == "fulfilled") {
                if (v.value) {
                  const cost = precision(v.value.amount + v.value.fee);
                  const interest = precision(-v.value.fee);
                  const interestRate = precision((interest * 100) / cost);

                  newHoldings.push({
                    amount: v.value.amount,
                    buy_date: v.value.deal_date,
                    buy_price: v.value.price,
                    count: v.value.count,
                    cur_price: v.value.price,
                    fee: v.value.fee,
                    interest: interest,
                    interest_rate: interestRate,
                    symbol: v.value.symbol,
                    deal_ids: v.value.deal_id,
                  });

                  account.available = precision(account.available - cost);
                  account.holding = precision(account.holding + v.value.amount);
                  account.amount = account.holding + account.available;

                  deals.push(v.value);
                }
              }
            });
          });
        }

        if (preHolding && preHolding.length > 0) {
          await promiseSettled(preHolding, (v) =>
            backTestingSellStock(v, curDateStr)
          ).then((res) => {
            res.forEach((v, i) => {
              if (v.status == "fulfilled") {
                if (v.value) {
                  const deal = v.value;
                  const holding = preHolding[i];

                  const sellAmount = deal.amount - deal.fee;

                  const interest = precision(
                    holding.interest +
                      (deal.price - holding.buy_price) * deal.count -
                      deal.fee
                  );
                  const interestRate = precision(
                    (interest * 100) / (holding.amount - holding.interest)
                  );

                  const holdingHistory: BackTestingHoldingHistoryModel = {
                    symbol: holding.symbol,
                    buy_date: holding.buy_date,
                    buy_price: holding.buy_price,
                    count: holding.count,
                    sell_date: deal.deal_date,
                    sell_price: deal.price,
                    deal_ids: holding.deal_ids + "," + deal.deal_id,
                    interest: interest,
                    interest_rate: interestRate,
                  };

                  holdingHistories.push(holdingHistory);

                  account.available = precision(account.available + sellAmount);
                  account.holding = precision(account.holding - sellAmount);
                  account.amount = precision(
                    account.available + account.holding
                  );

                  deals.push(deal);
                } else {
                  newHoldings.push(preHolding[i]);
                }
              } else {
                newHoldings.push(preHolding[i]);
              }
            });
          });
        }

        account.interest = precision(account.amount - account.init_amount);
        account.interest_rate = precision(
          (account.interest * 100) / account.init_amount
        );
      }

      holdingMap[curDateStr] = newHoldings;
    }

    console.log(account);
    console.log(holdingHistories);
  }

  async function getFilterStockMap(dates: string[]) {
    const stocksMap: Record<string, StockModel[]> = {};

    const limit = pLimit(10);

    const promises: Promise<boolean>[] = [];

    dates.forEach((v) => {
      promises.push(
        limit(() => {
          return new Promise<boolean>((resolve, reject) => {
            filterStocks(undefined, v)
              .then((res) => {
                if (res) {
                  stocksMap[v] = res;
                }
              })
              .finally(() => {
                resolve(true);
              });
          });
        })
      );
    });

    await Promise.allSettled(promises);

    return stocksMap;
  }

  function backTestingBuyStock(
    symbol: string,
    date: string,
    planAmount: number
  ) {
    return new Promise<BackTestingDealModel | undefined>((resolve, reject) => {
      Storage.getStockSnapshotBySymbolAndDate(symbol, date)
        .then((res) => {
          if (Array.isArray(res?.data) && res.data.length > 0) {
            const stock = res.data[0];

            if (!stock.open || stock.open == stock.top_price) {
              resolve(undefined);
              return;
            }

            const buyPrice = Number(stock.open);

            let count = Math.floor(planAmount / buyPrice / 100) * 100;

            let amount = precision(count * buyPrice);

            let fee = calcFee(amount, 0);

            while (fee + amount > planAmount) {
              count -= 100;
              if (count <= 0) {
                break;
              }
              amount = precision(count * buyPrice);
              fee = calcFee(amount, 0);
            }

            if (count > 0) {
              resolve({
                amount: amount,
                count: count,
                deal_date: stock.date,
                deal_id: genID(),
                deal_type: 0,
                fee: fee,
                price: buyPrice,
                symbol: symbol,
              });
            } else {
              resolve(undefined);
            }
          } else {
            resolve(undefined);
          }
        })
        .catch(() => {
          resolve(undefined);
        });
    });
  }

  function backTestingSellStock(
    holding: BackTestingHoldingModel,
    sellDate: string
  ) {
    return new Promise<BackTestingDealModel | undefined>((resolve, reject) => {
      Storage.getStockSnapshotBySymbolAndDate(holding.symbol, sellDate)
        .then((res) => {
          if (Array.isArray(res?.data) && res.data.length > 0) {
            const stock = res.data[0];

            if (
              !stock.close ||
              !stock.open ||
              stock.close == stock.bottom_price
            ) {
              resolve(undefined);
              return;
            }

            const sellPrice = Number(stock.close);

            let amount = precision(holding.count * sellPrice);

            let fee = calcFee(amount, 1);

            resolve({
              amount: amount,
              count: holding.count,
              deal_date: stock.date,
              deal_id: genID(),
              deal_type: 1,
              fee: fee,
              price: sellPrice,
              symbol: stock.symbol,
            });
          } else {
            resolve(undefined);
          }
        })
        .catch(() => {
          resolve(undefined);
        });
    });
  }
}
