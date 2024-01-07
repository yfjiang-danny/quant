import * as fs from "fs";
import { access, constants } from "fs/promises";
import moment from "moment";
import xlsx, { WorkSheet } from "node-xlsx";

export interface SheetDataModel<T = any> {
  name: string;
  data: T[][];
}

export namespace Excel {
  export function read(filePath: string) {
    return new Promise<SheetDataModel[] | null>((resolve) => {
      try {
        access(filePath, constants.F_OK).then(
          () => {
            const sheets = xlsx.parse(filePath);
            resolve(sheets);
          },
          (e) => {
            console.log(e);
            resolve(null);
          }
        );
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

  export function append<T = unknown>(
    data: WorkSheet<T>,
    filePath: string,
    before = false
  ) {
    return new Promise<boolean>((resolve) => {
      try {
        if (!filePath) {
          console.log(`${filePath} do not exist`);
          return false;
        }

        read(filePath).then((res) => {
          const newData = [];
          if (res) {
            const oldData = res.map((v) => ({ ...v, options: {} }));
            newData.push(...oldData);
            if (oldData.find((v) => v.name === data.name)) {
              data.name += moment().format("hhmmss");
            }
            if (before) {
              newData.unshift(data);
            } else {
              newData.push(data);
            }
          } else {
            newData.push(data);
          }
          const buffer = xlsx.build(newData);
          fs.writeFile(filePath, buffer, function (err) {
            if (err) {
              console.log("Write failed: " + err);
              resolve(false);
            }

            console.log("Write completed.");
            resolve(true);
          });
        });
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }

  export async function insertToExcel({
    columns,
    data,
    filePath,
    sheetName,
    before = true,
  }: {
    columns: Record<string, string>;
    data: Record<string, unknown>[];
    filePath: string;
    before?: boolean;
    sheetName?: string;
  }) {
    if (!filePath) {
      console.log(`filePath can not be null`);

      return false;
    }

    const rows: unknown[][] = [];

    const columnKeys = Object.keys(columns);

    rows.push(columnKeys);

    const header: string[] = [];
    columnKeys.forEach((key) => {
      header.push(columns[key]);
    });
    rows.push(header);

    data.forEach((v) => {
      const row: unknown[] = [];
      columnKeys.forEach((key, i) => {
        row.push(v[key] || "");
      });
      rows.push(row);
    });

    const newSheet: WorkSheet = {
      name: sheetName || moment().format("YYYYMMDD"),
      data: rows,
      options: {},
    };

    return append(newSheet, filePath, before);
  }
}
