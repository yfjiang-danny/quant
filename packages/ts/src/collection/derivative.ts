import * as dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { logRootPath } from "../common/paths";
import { IStockLadderTable } from "../db/interface/ladder";
import { logger } from "../logs";
import { Storage } from "../service/storage/storage";
import { StockLadderTableModel } from "../db/tables/ladder";
import { StockSnapshotTable } from "../db/tables/snapshot";
import { promiseSettled } from "../utils/promise";

dotenv.config();

const logPath = path.resolve(logRootPath, "derivative.log");

async function calcLadder(symbol: string, date?: string) {
  const histories = await Storage.getStockHistoriesFromDB(
    symbol,
    20,
    0,
    date ? StockSnapshotTable.date.lte(date) : undefined
  ).then((res) => res.data);

  let i = 0;

  while (i < histories.length - 1) {
    if (histories[i].close !== histories[i].top_price) {
      break;
    }
    i++;
  }

  return i + 1;
}

export async function fillingLadder(date?: string) {
  date = date ?? moment().format("YYYYMMDD");

  const limitedStocks = await Storage.getStockSnapshotByDate(date).then(
    (res) => res.data
  );
  if (!limitedStocks || limitedStocks.length <= 0) {
    logger.info(`FillingLadder failed: stocks is empty`, logPath);

    return;
  }

  // const preLadder = await IStockLadderTable.getStockLadderByDate

  const upperLimit: StockLadderTableModel[] = [];

  await promiseSettled(limitedStocks, (v) => calcLadder(v.symbol, date)).then(
    (res) => {
      res.forEach((v, i) => {
        const s = limitedStocks[i];
        if (v.status === "fulfilled") {
          upperLimit.push({
            date: s.date,
            name: s.name,
            symbol: s.symbol,
            ladder: v.value,
          });
        } else {
          upperLimit.push({
            date: s.date,
            name: s.name,
            symbol: s.symbol,
            ladder: 1,
          });
        }
      });
    }
  );

  if (upperLimit && upperLimit.length > 0) {
    await Storage.insertUpperLimitStocks(upperLimit);
  }

  logger.info(`FillingLadder success`, logPath);
}
