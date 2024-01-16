import { accessSync } from "fs";
import moment from "moment";
import path from "path";

/**
 * 找最近存在数据的日期
 * @param rootPath
 * @param d
 * @returns
 */
export function findExistDate(rootPath: string, d?: string) {
  const date = moment(d);
  let dateStr = date.format("YYYYMMDD");
  let success = false;
  let max = 10;

  while (!success && max > 0) {
    try {
      accessSync(path.resolve(rootPath, dateStr));
      success = true;
      break;
    } catch (error) {
      date.subtract(1, "days");
      dateStr = date.format("YYYYMMDD");
    }

    max--;
  }
  return success ? dateStr : undefined;
}

export function isWorkday(date?: string) {
  return moment(date).isoWeekday() < 6;
}
