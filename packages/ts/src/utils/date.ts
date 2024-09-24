import { isHoliday } from "chinese-calendar-ts";
import { accessSync } from "fs";
import moment from "moment";
import path from "path";

/**
 * 找最近存在数据的日期
 * @param rootPath
 * @param d
 * @returns
 */
export function findExistDate(rootPath: string, d?: string, ext?: string) {
  const mDate = moment(d);
  let dateStr = mDate.format("YYYYMMDD");
  let success = false;
  let max = 30;

  while (!success && max > 0) {
    try {
      let filePath = path.resolve(rootPath, dateStr);
      if (ext) {
        filePath += ext;
      }

      accessSync(filePath);
      success = true;
      break;
    } catch (error) {
      mDate.subtract(1, "days");
      dateStr = mDate.format("YYYYMMDD");
    }

    max--;
  }
  return success ? dateStr : undefined;
}

export function isTradeDate(d: Date) {
  const day = d.getDay();

  return !isHoliday(d) && day > 0 && day < 6;
}

export function getLatestTradeDates(
  num = 1,
  from = new Date(),
  format = "YYYYMMDD"
) {
  const res: string[] = [];

  const m = moment(from);

  let i = 0;
  while (i < num) {
    if (isTradeDate(m.toDate())) {
      res.push(m.format(format));
      i++;
    }
    m.add(-1, "d");
  }

  return res;
}
