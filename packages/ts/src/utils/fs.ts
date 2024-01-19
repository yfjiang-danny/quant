import { access, mkdir, readFile, writeFile } from "fs/promises";

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

export function readJsonFile<T>(filePath: string) {
  return new Promise<T>((resolve, reject) => {
    access(filePath).then(
      () => {
        readFile(filePath).then(
          (data) => {
            try {
              resolve(JSON.parse(data.toString()));
            } catch (error) {
              reject("Data parse error");
            }
          },
          (e) => {
            console.log(e);
            reject("Read file error");
          }
        );
      },
      (e) => {
        console.log(e);
        reject(`${filePath} do not exist`);
      }
    );
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
