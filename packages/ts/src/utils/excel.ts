import * as fs from "fs";
import xlsx, { WorkSheet } from "node-xlsx";

export interface SheetDataModel<T = any[]> {
  name: string;
  data: T[][];
}

export namespace Excel {
  export function read(filePath: string) {
    return new Promise<SheetDataModel[] | null>((resolve) => {
      try {
        const sheets = xlsx.parse(filePath);
        resolve(sheets);
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    });
  }

  export function write<T = unknown>(data: WorkSheet<T>[], filePath: string) {
    return new Promise<boolean>((resolve) => {
      try {
        const buffer = xlsx.build(data);
        fs.writeFile(filePath, buffer, function (err) {
          if (err) {
            console.log("Write failed: " + err);
            resolve(false);
          }

          console.log("Write completed.");
          resolve(true);
        });
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }
}
