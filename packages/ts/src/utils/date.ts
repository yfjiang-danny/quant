import { accessSync } from "fs";
import moment from "moment";
import path from "path";
import { dbPath } from "../tasks/common";

export function findLatestTradeDate(d?: string) {
  const date = moment(d);
  let dateStr = date.format("YYYYMMDD");
  let success = false;
  let max = 10;

  while (!success && max > 0) {
    try {
      accessSync(path.resolve(dbPath, dateStr));
      success = true;
      break;
    } catch (error) {
      date.subtract(1, "days");
      dateStr = date.format("YYYYMMDD");
    }

    max--;
  }
  return success ? dateStr : null;
}

export function isWorkday(date?: string) {
  return moment(date).isoWeekday() < 6;
}
