import * as dotenv from "dotenv";
import path from "path";
import { createDir } from "../utils/fs";

dotenv.config();

export const rootPath = process.env.ROOT || path.resolve(".", ".");
export const dbRootPath = process.env.DB_ROOT || path.resolve(rootPath, "db");
export const historyRootPath = path.resolve(dbRootPath, "history");
export const allStockRootPath = path.resolve(dbRootPath, "all");

export const logRootPath =
  process.env.LOG_ROOT || path.resolve(rootPath, "logs");

export function initPath() {
  createDir(rootPath).then(() => {
    createDir(dbRootPath).then(() => {
      createDir(historyRootPath);
      createDir(allStockRootPath);
    });
    createDir(logRootPath);
  });
}