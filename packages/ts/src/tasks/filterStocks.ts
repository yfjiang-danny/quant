import { isHoliday } from "chinese-calendar-ts";
import moment from "moment";
import Mail from "nodemailer/lib/mailer";
import path from "path";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { Strategies } from "../strategies";
import { drawCodeToImg } from "./utils";

const logPath = path.resolve(logRootPath, "filterStocks.log");

let sendMail = false;
export async function filterStocks(
  cb?: (msg?: string) => void,
  mailer?: Mailer163
) {
  if (isHoliday(new Date())) {
    logger.info(`${new Date().toDateString()} is holiday, return`);
    return;
  }
  sendMail = false;
  const stocks = await Strategies.filterStocks();

  if (stocks && stocks.length > 0) {
    drawCodeToImg(stocks)
      .then((files) => {
        if (files) {
          const imgsMailContent: Pick<Mail.Options, "attachments" | "html"> =
            {};
          imgsMailContent.html = ``;
          imgsMailContent.attachments = [];
          files.forEach((v) => {
            const [name, ext] = path.basename(v).split(".");
            imgsMailContent.html += `<img src="cid:${name}"/>`;
            imgsMailContent.attachments?.push({
              filename: `${name}.${ext}`,
              path: v,
              cid: name, //same cid value as in the html img src
            });
          });

          try {
            const mailOptions: Mail.Options = {
              to: process.env.MAIL_USER_NAME,
              subject: moment().format("YYYY-MM-DD"),
              html: imgsMailContent.html,
              attachments: [...(imgsMailContent.attachments || [])],
            };

            mailer
              ?.send(mailOptions)
              .then((res) => {
                logger.info(res, logPath);
                sendMail = true;
              })
              .catch((e) => {
                logger.info(e, logPath);
              });
          } catch (error) {
            logger.info(error, logPath);
          }
        }
      })
      .finally(() => {
        cb?.();
      });
  }
}
