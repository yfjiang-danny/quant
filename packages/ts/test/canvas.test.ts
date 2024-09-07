import * as dotenv from "dotenv";
import { Excel } from "../src/utils/excel";
import { DrawColumnModel, drawTable } from "../src/utils/canvas";
import path from "path";

const testFile = path.resolve("filter_current_20240301.xlsx");

dotenv.config();

(async function test() {
  const index: number[] = [2, 1];
  Excel.read(testFile).then((res) => {
    try {
      if (res && res.length > 0) {
        const data = res[0].data;
        const keys = data[0];
        const names = data[1];
        const rows = data.slice(2);

        const columns: DrawColumnModel[] = index.map((i) => {
          return {
            key: keys[i],
            name: names[i],
            width: 140,
          };
        });

        const drawData = rows.map((v) => {
          const row: Record<string, string> = {};
          index.forEach((i, j) => {
            if (v[i]) {
              row[columns[j].key] = v[i];
            }
          });
          return row;
        });

        drawTable(columns, drawData);
      }
    } catch (error) {
      console.log(error);
    }
  });
})();
