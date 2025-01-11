import * as dotenv from "dotenv";
import path from "path";
import { logRootPath } from "../src/common/paths";
import { logger } from "../src/logs";
import { TUSHARE_API } from "../src/third/tushare/api";

dotenv.config();

(async function test() {
  // TUSHARE_API.getAllStock().then((res) => {
  //     logger.info(res, path.resolve(logRootPath, "tushare.log"));
  //   });
  TUSHARE_API.getAllStock({ exchange: "", list_status: "D" }).then((res) => {
    logger.info(res, path.resolve(logRootPath, "tushare.d.log"));
  });
})();
