import { isHoliday } from "chinese-calendar-ts";
import moment from "moment";
import { WorkSheet } from "node-xlsx";
import Mail from "nodemailer/lib/mailer";
import path from "path";
import { stocksToSheetData } from "../common";
import { filterRootPath, logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { fillStocksSMA } from "../service/factors/sma";
import { Storage } from "../service/storage/storage";
import { fillEastStockInfo } from "../service/utils";
import { Strategies } from "../strategies";
import { Excel } from "../utils/excel";
import { drawCodeToImg } from "./utils";

const logPath = path.resolve(logRootPath, "filter_current.log");

export async function filterCurrent(
  cb?: (msg?: string) => void,
  mailer?: Mailer163,
  skipEast?: boolean
) {
  if (isHoliday(new Date())) {
    logger.info(`${new Date().toDateString()} is holiday, return`);
    return;
  }
  const latestStock = await Storage.getStockHistoriesFromDB("000001", 1).then(
    (res) => {
      return res.data?.[0];
    }
  );

  const minCapitalStocks = (
    await Strategies.getMinCapitalStocks(100, latestStock?.date)
  )?.filter((v) => !v.name || (v.name && !v.name.toUpperCase().includes("ST")));

  if (!minCapitalStocks || minCapitalStocks.length <= 0) {
    logger.info(`Storage.getAllStocks is empty`, logPath);

    return;
  }

  // 获取实时行情，过滤掉 ST
  const newStocks = skipEast
    ? minCapitalStocks
    : await fillEastStockInfo(minCapitalStocks);

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

  const sheets: WorkSheet[] = [];
  sheets.push({
    name: "cross",
    data: stocksToSheetData(crossStocks),
    options: {},
  });

  Promise.allSettled([
    drawCodeToImg(crossStocks),
    Excel.write(sheets, filePath),
  ])
    .then(([imgsRes]) => {
      const imgsMailContent: Pick<Mail.Options, "attachments" | "html"> = {};
      if (imgsRes.status === "fulfilled" && imgsRes.value) {
        imgsMailContent.html = ``;
        imgsMailContent.attachments = [];
        imgsRes.value.forEach((v) => {
          const [name, ext] = path.basename(v).split(".");
          imgsMailContent.html += `<img src="cid:${name}"/>`;
          imgsMailContent.attachments?.push({
            filename: `${name}.${ext}`,
            path: v,
            cid: name, //same cid value as in the html img src
          });
        });
      }
      try {
        const mailOptions: Mail.Options = {
          to: process.env.MAIL_USER_NAME,
          subject: moment().format("YYYY-MM-DD"),
          html: imgsMailContent.html,
          attachments: [
            {
              filename: `filter-${moment().format("YYYYMMDD")}.xlsx`,
              path: filePath,
            },
            ...(imgsMailContent.attachments || []),
          ],
        };

        mailer
          ?.send(mailOptions)
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
