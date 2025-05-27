import { Response } from "./type";

export function tableQuery<T>(promise: Promise<{ rows: unknown }>) {
  return new Promise<Response<T[]>>((resolve) => {
    promise
      .then(
        (res) => {
          console.log("tableQuery res", res);

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
