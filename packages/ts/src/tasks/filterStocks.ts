import moment from "moment";
import path from "path";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { Strategies } from "../strategies";

const logPath = path.resolve(logRootPath, "filterStocks.log");

let sendMail = false;
export async function filterStocks(
  cb?: (msg?: string) => void,
  mailer?: Mailer163
) {
  sendMail = false;
  await Strategies.filterStocks()
    .then(async (filePath) => {
      if (sendMail) {
        logger.info(`Mail has been send`);
        cb?.(`Mail has been send`);
        return;
      }
      if (!filePath) {
        cb?.(`Filter stocks error`);
        return;
      }
      try {
        // const mailer = new Mailer163();

        await mailer
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
            sendMail = true;
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
