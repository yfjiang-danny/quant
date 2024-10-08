import * as dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { logRootPath } from "../common/paths";
import { IStockLadderTable } from "../db/interface/ladder";
import { logger } from "../logs";
import { Storage } from "../service/storage/storage";
import { StockLadderTableModel } from "../db/tables/ladder";

dotenv.config();

const logPath = path.resolve(logRootPath, "derivative.log");

async function calcLadder(symbol: string) {
  const histories = await Storage.getStockHistoriesFromDB(symbol).then(
    (res) => res.data
  );

  let i = 0;
  while (i < histories.length - 1) {
    if (histories[i].close !== histories[i].top_price) {
      return i;
    }
    i++;
  }

  return i;
}

export async function fillingLadder(date?: string) {
  date = date ?? moment().format("YYYYMMDD");

  const limitedStocks = await Storage.getStockSnapshotByDate(date).then((res) =>
    res.data.filter((v) => v.close == v.top_price)
  );
  if (!limitedStocks || limitedStocks.length <= 0) {
    logger.info(`FillingLadder failed: stocks is empty`, logPath);

    return;
  }

  // const preLadder = await IStockLadderTable.getStockLadderByDate

  const upperLimit: StockLadderTableModel[] = [];
  for (const v of limitedStocks) {
    upperLimit.push({
      date: v.date,
      name: v.name,
      symbol: v.symbol,
      ladder: await calcLadder(v.symbol),
    });
  }

  if (upperLimit && upperLimit.length > 0) {
    await IStockLadderTable.insert(upperLimit);
  }

  logger.info(`FillingLadder success`, logPath);
}
