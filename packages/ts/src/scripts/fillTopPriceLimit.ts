import * as dotenv from "dotenv";
import pLimit from "p-limit";
import { StockModel } from "../models/type";
import { Storage } from "../service/storage/storage";
import { calcBottomPriceLimit, calcTopPriceLimit } from "../service/utils";
import { getLatestTradeDates } from "../utils/date";
import { batchTask } from "../utils/util";
dotenv.config();

(async function main() {
  const latestDates = getLatestTradeDates(11);

  const limit = pLimit(10);

  let i = 0;
  while (i < latestDates.length) {
    const d = latestDates[i];

    i++;
    const stocks = await Storage.getStockSnapshotByDate(d).then((res) => {
      if (res.data) {
        return res.data;
      }
      return [];
    });

    if (!stocks || stocks.length == 0) {
      continue;
    }

    batchTask(stocks, 500, (s) => {
      limit(() =>
        Storage.updateStockHistories(
          s.map((v) => {
            const pre_close = Number(v.close) - Number(v.change);
            const nv = {
              ...v,
            };

            if (!isNaN(pre_close)) {
              nv.top_price = calcTopPriceLimit({
                ...v,
                close: pre_close,
              } as unknown as StockModel);
              nv.bottom_price = calcBottomPriceLimit({
                ...v,
                close: pre_close,
              } as unknown as StockModel);
            }

            return nv;
          })
        )
      );
    });
  }
})();
