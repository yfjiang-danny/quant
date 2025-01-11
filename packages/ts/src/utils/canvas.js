"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTable = void 0;
var PImage = require("pureimage");
var fs = require("fs");
var paths_1 = require("../common/paths");
function drawTable(columns, data, filename, fileDir) {
    if (fileDir === void 0) { fileDir = paths_1.imgRootPath; }
    var fontSize = 24;
    var gap = fontSize / 2;
    var columnStart = [];
    var w = columns.reduce(function (res, cur) {
        columnStart.push(res);
        return res + cur.width;
    }, 10) + 10, h = (data.length + 1) * (fontSize + gap) + fontSize * 2;
    var fnt = PImage.registerFont("src/assets/fonts/QingNiaoHuaGuangJianMeiHei-2.ttf", "Noto Sans SC");
    fnt.loadSync();
    // make image
    var img1 = PImage.make(w, h);
    // get canvas context
    var ctx = img1.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#000000";
    ctx.font = "".concat(fontSize, "px 'Noto Sans SC'");
    var rowHeight = fontSize + gap;
    // header
    columns.forEach(function (v, i) {
        ctx.fillText(v.name, columnStart[i], rowHeight);
    });
    // rows
    data.forEach(function (rowData, rowIndex) {
        columns.forEach(function (column, columnIndex) {
            var key = column.key;
            if (typeof rowData[key] === "string" ||
                typeof rowData[key] === "number") {
                ctx.fillText(rowData[key].toString(), columnStart[columnIndex], (rowIndex + 2) * rowHeight + rowHeight * 0.5);
            }
        });
    });
    return new Promise(function (resolve) {
        var fileName = "".concat(fileDir, "/").concat(filename, ".png");
        PImage.encodePNGToStream(img1, fs.createWriteStream(fileName))
            .then(function () {
            console.log("Wrote out the png file to ".concat(fileName));
            resolve(fileName);
        })
            .catch(function (e) {
            console.log("There was an error on writing to ".concat(fileName));
            resolve(undefined);
        });
    });
}
exports.drawTable = drawTable;
