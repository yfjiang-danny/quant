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
  const latestStock = await Storage.getStockHistoriesFromDB("000001", 1).then(
    (res) => {
      return res.data?.[0];
    }
  );

  const minCapitalStocks = await Strategies.getMinCapitalStocks(
    300,
    latestStock?.date
  );

  if (!minCapitalStocks || minCapitalStocks.length <= 0) {
    logger.info(`Storage.getAllStocks is empty`, logPath);

    return;
  }

  // 获取实时行情，过滤掉 ST
  const newStocks = (await fillEastStockInfo(minCapitalStocks)).filter(
    (v) => !v.name || (v.name && !v.name.toUpperCase().includes("ST"))
  );

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
            to: process.env.MAIL_USER_NAME,
            subject: moment().format("YYYY-MM-DD"),
            attachments: [
              {
                filename: `filter-${moment().format("YYYYMMDD")}.xlsx`,
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
