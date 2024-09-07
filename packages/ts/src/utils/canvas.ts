import * as PImage from "pureimage";
import * as fs from "fs";
import moment from "moment";

export interface DrawColumnModel {
  name: string;
  width: number;
  key: string;
}

export function drawTable(
  columns: DrawColumnModel[],
  data: Record<string, string | number>[]
) {
  const fontSize = 24;

  const gap = fontSize / 2;

  const columnStart: number[] = [];

  const w =
      columns.reduce((res, cur) => {
        columnStart.push(res);
        return res + cur.width;
      }, 10) + 10,
    h = (data.length + 1) * (fontSize + gap) + fontSize * 2;

  const fnt = PImage.registerFont(
    "src/assets/fonts/QingNiaoHuaGuangJianMeiHei-2.ttf",
    "Noto Sans SC"
  );
  fnt.loadSync();

  // make image
  const img1 = PImage.make(w, h);

  // get canvas context
  const ctx = img1.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#000000";
  ctx.font = `${fontSize}px 'Noto Sans SC'`;

  const rowHeight = fontSize + gap;

  // header
  columns.forEach((v, i) => {
    ctx.fillText(v.name, columnStart[i], rowHeight);
  });

  // rows
  data.forEach((rowData, rowIndex) => {
    columns.forEach((column, columnIndex) => {
      const key = column.key;
      if (
        typeof rowData[key] === "string" ||
        typeof rowData[key] === "number"
      ) {
        ctx.fillText(
          rowData[key].toString(),
          columnStart[columnIndex],
          (rowIndex + 2) * rowHeight + rowHeight * 0.5
        );
      }
    });
  });

  return new Promise<boolean>((resolve) => {
    const fileName = `${moment().format("YYYYMMDD")}.png`;
    PImage.encodePNGToStream(img1, fs.createWriteStream(fileName))
      .then(() => {
        console.log(`Wrote out the png file to ${fileName}`);
        resolve(true);
      })
      .catch((e) => {
        console.log(`There was an error on writing to ${fileName}`);
        resolve(false);
      });
  });
}
