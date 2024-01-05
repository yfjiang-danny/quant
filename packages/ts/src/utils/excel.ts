import * as fs from "fs";
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

  export async function saveToExcel({
    columns,
    data,
    filePath,
    sheetName,
  }: {
    columns: Record<string, string>;
    data: Record<string, unknown>[];
    filePath: string;
    sheetName?: string;
  }) {
    if (!filePath) {
      console.log(`filePath can not be null`);

      return false;
    }

    const rows: unknown[][] = [];

    const columnKeys = Object.keys(columns);
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
    const newXlsx: WorkSheet[] = [newSheet];

    // Old sheet data
    const oldData = await Excel.read(filePath);
    if (oldData) {
      oldData.forEach((v) => {
        newXlsx.push({
          ...v,
          options: {},
        });
      });
    }
    return Excel.write(newXlsx, filePath);
  }
}
