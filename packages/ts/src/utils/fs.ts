import { access, mkdir, readFile, writeFile } from "fs/promises";
import { Queue } from "./queue";

const fsQueue = new Queue();

export function createDir(dir: string) {
  return new Promise<undefined>((resolve, reject) => {
    access(dir).then(
      () => resolve(undefined),
      () => {
        console.log(`${dir} do not exist, creating...`);

        mkdir(dir).then(
          () => resolve(undefined),
          (e) => {
            console.log(`Create ${dir} error: `, e);

            reject(e);
          }
        );
      }
    );
  });
}

export function readJsonFileInBatch<T = unknown>(
  filePaths: string[],
  batch = 10
) {
  return new Promise<(T | null)[]>((resolve) => {
    fsQueue.add({ filePaths, batch }, ({ data }, done) => {
      const params = data as { filePaths: string[]; batch: number };
      readJsonFiles<T>(params.filePaths, params.batch)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          resolve([]);
          console.log(e);
        })
        .finally(() => {
          done();
        });
    });
  });
}

export async function readJsonFiles<T = unknown>(
  filePaths: string[],
  batch = 10
) {
  const res: (T | null)[] = [];
  let i = 0,
    len = filePaths.length;
  while (i < len) {
    let promises: Promise<T | null>[] = [];
    while (promises.length < batch && i < len) {
      promises.push(readJsonFile(filePaths[i]));
      i++;
    }

    const batchRes = await Promise.allSettled([...promises]);
    batchRes.forEach((v) => {
      if (v.status === "fulfilled") {
        res.push(v.value);
      } else {
        res.push(null);
      }
    });

    promises = [];
  }
  // console.log(res);

  return res;
}

export function readJsonFile<T>(filePath: string) {
  return new Promise<T | null>((resolve) => {
    access(filePath)
      .then(
        () => {
          readFile(filePath).then(
            (data) => {
              try {
                resolve(JSON.parse(data.toString()));
              } catch (error) {
                console.log(error);

                resolve(null);
              }
            },
            (e) => {
              console.log(e);
              resolve(null);
            }
          );
        },
        (e) => {
          console.log(e);
          resolve(null);
        }
      )
      .catch((e) => {
        console.log(e);
        resolve(null);
      });
  });
}

export function iWriteFile(
  filePath: string,
  data: string | Buffer,
  override: boolean
) {
  if (override) {
    return writeFile(filePath, data);
  }
  return new Promise<void>((resolve, reject) => {
    access(filePath).then(
      () => {
        console.log(`${filePath} is exist, do not override`);
        resolve();
      },
      () => {
        writeFile(filePath, data).then(resolve, reject);
      }
    );
  });
}
