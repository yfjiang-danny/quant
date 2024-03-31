import path from "path";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import { StockModel } from "../models/type";
import { Storage } from "../service/storage/storage";
import { calcTopPriceLimit, fillEastStockInfo } from "../service/utils";
import { IStockLadderTable } from "../../models/interface/ladder";
import { StockLadderTableModel } from "../db/model";

const logPath = path.resolve(logRootPath, "filter_ladder.log");

async function calcLadder(stock: StockModel) {
  const histories = await Storage.getStockHistories(
    stock.symbol as string
  ).then((res) => res.data);

  let i = 0;
  while (i < histories.length - 1) {
    histories[i].topPrice = Number(calcTopPriceLimit(histories[i + 1]));
    if (histories[i].close !== histories[i].topPrice) {
      return i;
    }
    i;
  }

  return i + 1;
}

export async function filterLadder() {
  const allStocks = await Storage.getStockInfosFromDB().then((res) => res.data);
  if (!allStocks || allStocks.length <= 0) {
    logger.info(`stocks is empty`, logPath);

    return;
  }

  // 获取实时行情，过滤掉 ST
  const newStocks = (await fillEastStockInfo(allStocks)).filter(
    (v) => !v.name || (v.name && !v.name.toUpperCase().includes("ST"))
  );

  logger.info(newStocks, path.resolve(logRootPath, "20240324.json"));

  const upperLimit = newStocks.filter((v) => v.close && v.close === v.topPrice);

  logger.info(upperLimit, path.resolve(logRootPath, "limit.json"));

  for (const v of upperLimit) {
    v.ladder = await calcLadder(v);
  }

  logger.info(upperLimit, path.resolve(logRootPath, "ladder.json"));

  if (upperLimit && upperLimit.length > 0) {
    await IStockLadderTable.insert(
      upperLimit.map((v) => {
        return {
          date: v.date,
          ladder: v.ladder,
          name: v.name,
          symbol: v.symbol,
        } as StockLadderTableModel;
      })
    );
  }
}
