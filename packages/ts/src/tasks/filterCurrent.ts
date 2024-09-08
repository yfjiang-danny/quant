import moment from "moment";
import { WorkSheet } from "node-xlsx";
import path from "path";
import { stocksToSheetData } from "../common";
import { filterRootPath, imgRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { StockModel } from "../models/type";
import { fillStocksSMA } from "../service/factors/sma";
import { Storage } from "../service/storage/storage";
import { fillEastStockInfo } from "../service/utils";
import { Strategies } from "../strategies";
import { drawTable } from "../utils/canvas";
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

  const crossStocks = await Strategies.filterCross(smaStocks);

  if (!crossStocks) {
    cb?.(`filterCurrent sheets is empty`);
    logger.info("filterCurrent sheets is empty", logPath);

    return;
  }

  const filePath = path.resolve(
    filterRootPath,
    `filter_current_${moment().format("YYYYMMDD")}.xlsx`
  );

  const imgName = `cross_${moment().format("YYYYMMDD")}`;
  const imgPath = path.resolve(imgRootPath, `${imgName}.png`);

  const sheets: WorkSheet[] = [];
  sheets.push({
    name: "cross",
    data: stocksToSheetData(crossStocks),
    options: {},
  });

  Promise.allSettled([
    drawTable(
      [
        { key: "name", name: "股票名称", width: 140 },
        { key: "code", name: "股票代码", width: 140 },
      ],
      crossStocks as Record<string, string | number>[],
      imgName
    ),
    Excel.write(sheets, filePath),
  ])
    .then(() => {
      try {
        mailer
          ?.send({
            to: process.env.MAIL_USER_NAME,
            subject: moment().format("YYYY-MM-DD"),
            html: `<img src="cid:cross_img"/>`,
            attachments: [
              {
                filename: `filter-${moment().format("YYYYMMDD")}.xlsx`,
                path: filePath,
              },
              {
                filename: `${imgName}.png`,
                path: imgPath,
                cid: "cross_img", //same cid value as in the html img src
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
    .catch((e) => {
      logger.info(e, logPath);
      cb?.();
    })
    .finally(() => {
      cb?.();
    });
}
