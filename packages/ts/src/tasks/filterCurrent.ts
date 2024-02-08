import moment from "moment";
import path from "path";
import { filterRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { StockModel } from "../models/type";
import { fillStocksSMA } from "../service/factors/sma";
import { Storage } from "../service/storage/storage";
import { fillEastStockInfo } from "../service/utils";
import { Strategies } from "../strategies";
import { Excel } from "../utils/excel";

const logPath = path.resolve(logRootPath, "filter_current.log");

export async function filterCurrent(
  cb?: (msg?: string) => void,
  mailer?: Mailer163
) {
  const allStocks: StockModel[] = await Storage.getAllStocks().then((res) => {
    return res.data;
  });

  if (allStocks.length <= 0) {
    logger.info(`Storage.getAllStocks is empty`, logPath);

    return;
  }

  const minCapitalStocks = allStocks
    .filter((v) => {
      const symbol = v.symbol;

      const isFitSymbol =
        !symbol ||
        symbol.startsWith("3") ||
        symbol.startsWith("60") ||
        symbol.startsWith("0");
      const capital = v.capital;
      return isFitSymbol && capital && capital < 100;
    })
    .sort((a, b) => (a.capital as number) - (b.capital as number));

  // 获取实时行情
  const newStocks = await fillEastStockInfo(minCapitalStocks);

  // 计算 sma
  const smaStocks = await fillStocksSMA(newStocks);

  const sheets = await Strategies.filterCross(smaStocks);

  if (!sheets) {
    cb?.(`filterCurrent sheets is empty`);
    logger.info("filterCurrent sheets is empty", logPath);

    return;
  }

  const filePath = path.resolve(
    filterRootPath,
    `filter_current_${moment().format("YYYYMMDD")}.xlsx`
  );

  Excel.write(sheets, filePath)
    .then(() => {
      try {
        mailer
          ?.send({
            to: "michael593@163.com",
            subject: moment().format("YYYY-MM-DD"),
            attachments: [
              {
                fileName: `filter-${moment().format("YYYYMMDD")}.xlsx`,
                path: filePath,
              },
            ],
          })
          .then((res) => {
            logger.info(res, logPath);
          })
          .catch((e) => {
            logger.info(e, logPath);
          });
      } catch (error) {
        logger.info(error, logPath);
      }
    })
    .finally(() => {
      cb?.();
    });
}
