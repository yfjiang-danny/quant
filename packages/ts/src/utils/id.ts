// import { v4 } from "uuid";

export function genID() {
  //   const fullUUID = v4().replace(/-/g, ""); // 去掉连字符
  //   const tenDigitID = fullUUID.substring(0, 10); // 取前10位
  const timeStr = Date.now().toString();
  return timeStr.slice(timeStr.length - 10);
}
