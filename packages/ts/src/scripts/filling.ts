import * as dotenv from "dotenv";
import { readdir } from "fs/promises";
import { historyRootPath, logRootPath } from "../common/paths";
import { Storage } from "../service/storage/storage";
import path from "path";
import { logger } from "../logs";
import { StockHistoryTableModel } from "../db/model";
import { StockModel } from "../models/type";
import { StockHistoriesTable } from "../db/tables";
import { calcBottomPriceLimit, calcTopPriceLimit } from "../service/utils";
dotenv.config();

async function fillTopAndBottomPrise(symbol: string) {
  const histories = await Storage.getStockHistoriesFromDB(symbol).then(
    (res) => res.data
  );
  // console.log(histories);
  let i = 0;
  while (i < histories.length - 1) {
    if (!histories[i + 1].top_price) {
      histories[i + 1].top_price = calcTopPriceLimit(
        histories[i] as unknown as StockModel
      );
    }
    if (!histories[i + 1].bottom_price) {
      histories[i + 1].bottom_price = calcBottomPriceLimit(
        histories[i] as unknown as StockModel
      );
    }
    i++;
  }
  await Storage.updateStockHistories(histories);
}

(async function main() {
  const allStocks = await Storage.getStockInfosFromDB().then((res) => res.data);

  let i = 0;
  while (i < allStocks.length) {
    await fillTopAndBottomPrise(allStocks[i].symbol as string);
    i++;
  }
})();
