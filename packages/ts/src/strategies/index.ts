import { StockModel } from "../common/type";
import { Storage } from "../storage/storage";

namespace Strategy {
  /**
   * 连涨天数
   * @param symbol
   * @param day
   */
  export function calculateMaxUpDay(symbol: string) {
    return Storage.getStockHistories(symbol).then(
      (res) => {
        const histories = res.data
          .filter((v) => {
            if (!v.date) {
              console.log(`Empty date: `, JSON.stringify(v));

              return false;
            }
            return true;
          })
          .sort((a, b) => Number(a.date) - Number(b.date));

        if (histories.length <= 1) {
          return null;
        }

        let max = 0,
          i = 1;
        while (i < histories.length) {
          const cur = histories[i - 1].close;
          const pre = histories[i].close;
          if (cur && pre && cur > pre) {
            max++;
            i++;
          } else {
            break;
          }
        }

        return max;
      },
      (e) => {
        console.log(e);

        return null;
      }
    );
  }

  export function up(stocks: StockModel[], day = 3): StockModel[] {
    const res: StockModel[] = [];

    return res;
  }
}
