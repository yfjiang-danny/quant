"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonFile = exports.createDir = void 0;
var promises_1 = require("fs/promises");
function createDir(dir) {
    return new Promise(function (resolve, reject) {
        (0, promises_1.access)(dir).then(function () { return resolve(undefined); }, function () {
            console.log("".concat(dir, " do not exist, creating..."));
            (0, promises_1.mkdir)(dir).then(function () { return resolve(undefined); }, function (e) {
                console.log("Create ".concat(dir, " error: "), e);
                reject(e);
            });
        });
    });
}
exports.createDir = createDir;
function readJsonFile(filePath) {
    return new Promise(function (resolve, reject) {
        (0, promises_1.access)(filePath).then(function () {
            (0, promises_1.readFile)(filePath).then(function (data) {
                try {
                    resolve(JSON.parse(data.toString()));
                }
                catch (error) {
                    reject("Data parse error");
                }
            }, function (e) {
                console.log(e);
                reject("Read file error");
            });
        }, function (e) {
            console.log(e);
            reject("".concat(filePath, " do not exist"));
        });
    });
}
exports.readJsonFile = readJsonFile;
