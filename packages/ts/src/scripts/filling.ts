import * as dotenv from "dotenv";
import { Storage } from "../service/storage/storage";

import { StockModel } from "../models/type";
import { calcBottomPriceLimit, calcTopPriceLimit } from "../service/utils";
dotenv.config();

async function fillingChange(symbol: string) {
  const histories = await Storage.getStockHistoriesFromDB(symbol).then(
    (res) => res.data
  );
  // console.log(histories);
  let i = 0;
  while (i < histories.length - 1) {
    if (histories[i].close && histories[i + 1].close) {
      histories[i].change = (
        Number(histories[i].close) - Number(histories[i + 1].close)
      ).toFixed(2);
    }

    i++;
  }
  await Storage.updateStockHistories(histories);
}

async function fillingTopAndBottomPrise(symbol: string) {
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
  const allStocks = await Storage.getStockInfosFromDB().then((res) => {
    if (res.msg) {
      console.log(res.msg);
    }
    return res.data;
  });

  let i = 0;
  while (i < allStocks.length) {
    await fillingChange(allStocks[i].symbol as string);
    i++;
  }
})();
