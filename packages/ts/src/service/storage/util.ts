import { TableTotalCountModel } from "../../db/interface/type";
import { Response } from "./type";

export function tableQuery<T>(promise: Promise<{ rows: unknown }>) {
  return new Promise<Response<T[]>>((resolve) => {
    promise
      .then(
        (res) => {
          resolve({ data: res.rows as unknown as T[] });
        },
        (e) => {
          resolve({ data: [], msg: e });
        }
      )
      .catch((e) => {
        resolve({ data: [], msg: e });
      });
  });
}

export function tableInsert(promise: Promise<{ rowCount: unknown }>) {
  return new Promise<Response<Number>>((resolve) => {
    promise
      .then(
        (res) => {
          resolve({ data: res.rowCount as unknown as number });
        },
        (e) => {
          resolve({ data: 0, msg: e });
        }
      )
      .catch((e) => {
        resolve({ data: 0, msg: e });
      });
  });
}

export function tableCount(promise: Promise<{ rows: unknown }>) {
  return new Promise<Response<Number>>((resolve) => {
    promise
      .then(
        (res) => {
          const rows = res.rows as unknown as TableTotalCountModel[];
          resolve({ data: rows?.[0]?.count || 0 });
        },
        (e) => {
          resolve({ data: 0, msg: e });
        }
      )
      .catch((e) => {
        resolve({ data: 0, msg: e });
      });
  });
}
