import { isHoliday } from "chinese-calendar-ts";
import path from "path";
import { logRootPath } from "../common/paths";
import { logger } from "../logs";
import { Strategies } from "../strategies";

const logPath = path.resolve(logRootPath, "simulation.log");

function log(msg: unknown) {
  logger.info(msg, logPath);
}

export async function buyPlanTask() {
  try {
    if (isHoliday(new Date())) {
      log(`${new Date().toDateString()} is holiday, return`);
      return;
    }
    Strategies.buyTask();
  } catch (error) {
    log(`Buy plans task exception: ${error}`);
  }
}

export async function buyEntrustmentTask() {
  try {
    if (isHoliday(new Date())) {
      log(`${new Date().toDateString()} is holiday, return`);
      return;
    }
    Strategies.buyEntrustmentTask();
  } catch (error) {
    log(`Buy entrustments task exception: ${error}`);
  }
}
