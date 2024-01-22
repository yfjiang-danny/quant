import moment from "moment";
import path from "path";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Mailer163 } from "../mail";
import { Strategies } from "../strategies";

const logPath = path.resolve(logRootPath, "filterStocks.log");

export function filterStocks(cb?: (msg?: string) => void) {
  Strategies.filterStocks((filePath) => {
    if (!filePath) {
      cb?.(`Filter stocks error`);
      return;
    }
    try {
      const mailer = new Mailer163();

      mailer
        .send({
          to: "michael593@163.com",
          subject: moment().format("YYYY-MM-DD"),
          attachments: [
            {
              fileName: `filter-${moment().format("YYYYMMDD")}.xlsx`,
              filePath: filePath,
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
  }).finally(() => {
    cb?.();
  });
}
