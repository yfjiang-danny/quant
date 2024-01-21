import * as dotenv from "dotenv";
import path from "path";
import { logger } from "../logs";
import { Strategies } from "../strategies";
import { rootPath } from "./common";

dotenv.config();

(function main() {
  logger.setFilePath(path.resolve(rootPath, "logs", "filter_stocks.log"));

  Strategies.filterStocks();
})();
