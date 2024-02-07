import dotenv from "dotenv";
import { readFile, readdir, rm, writeFile } from "fs/promises";
import pLimit from "p-limit";
import path from "path";
import { historyRootPath, logRootPath } from "../common/paths";

dotenv.config();

async function main() {
  try {
    const subFilePaths = await readdir(historyRootPath, { recursive: true });

    if (!subFilePaths || subFilePaths.length <= 0) {
      console.log(`Empty subFilePaths`);

      return;
    }

    const limit = pLimit(10);

    const filePaths: string[] = [];

    const filePathsPromises = subFilePaths.map((subFilePath) =>
      limit(() => {
        return readdir(path.resolve(historyRootPath, subFilePath)).then(
          (files) => {
            files.forEach((file) => {
              filePaths.push(path.resolve(historyRootPath, subFilePath, file));
            });
          },
          (e) => {
            console.log(e);
          }
        );
      })
    );

    await Promise.allSettled(filePathsPromises);

    const invalidPaths: string[] = [];

    const promises = filePaths.map((filePath) =>
      limit(() =>
        readFile(filePath)
          .then(
            (data) => {
              try {
                JSON.parse(data.toString());
              } catch (error) {
                invalidPaths.push(filePath);
              }
            },
            (e) => {
              console.log(e);
            }
          )
          .catch((e) => {
            console.log(e);
          })
      )
    );

    await Promise.allSettled(promises);

    await writeFile(
      path.resolve(logRootPath, "invalid.json"),
      JSON.stringify(invalidPaths)
    );

    while (invalidPaths.length > 0) {
      const p = invalidPaths.shift();
      p &&
        (await rm(p)
          .then(
            () => {
              console.log(`rm ${p}`);
            },
            (e) => {
              console.log(e);
            }
          )
          .catch((e) => {
            console.log(e);
          }));
    }
  } catch (error) {
    console.log(error);
  }
}

main();
