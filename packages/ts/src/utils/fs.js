"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iWriteFile = exports.readJsonFile = exports.readJsonFiles = exports.readJsonFileInBatch = exports.createDir = void 0;
var promises_1 = require("fs/promises");
var queue_1 = require("./queue");
var fsQueue = new queue_1.Queue();
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
function readJsonFileInBatch(filePaths, batch) {
    if (batch === void 0) { batch = 10; }
    return new Promise(function (resolve) {
        fsQueue.add({ filePaths: filePaths, batch: batch }, function (_a, done) {
            var data = _a.data;
            var params = data;
            readJsonFiles(params.filePaths, params.batch)
                .then(function (res) {
                resolve(res);
            })
                .catch(function (e) {
                resolve([]);
                console.log(e);
            })
                .finally(function () {
                done();
            });
        });
    });
}
exports.readJsonFileInBatch = readJsonFileInBatch;
function readJsonFiles(filePaths_1) {
    return __awaiter(this, arguments, void 0, function (filePaths, batch) {
        var res, i, len, promises, batchRes;
        if (batch === void 0) { batch = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = [];
                    i = 0, len = filePaths.length;
                    _a.label = 1;
                case 1:
                    if (!(i < len)) return [3 /*break*/, 3];
                    promises = [];
                    while (promises.length < batch && i < len) {
                        promises.push(readJsonFile(filePaths[i]));
                        i++;
                    }
                    return [4 /*yield*/, Promise.allSettled(__spreadArray([], promises, true))];
                case 2:
                    batchRes = _a.sent();
                    batchRes.forEach(function (v) {
                        if (v.status === "fulfilled") {
                            res.push(v.value);
                        }
                        else {
                            res.push(null);
                        }
                    });
                    promises = [];
                    return [3 /*break*/, 1];
                case 3: 
                // console.log(res);
                return [2 /*return*/, res];
            }
        });
    });
}
exports.readJsonFiles = readJsonFiles;
function readJsonFile(filePath) {
    return new Promise(function (resolve) {
        (0, promises_1.access)(filePath)
            .then(function () {
            (0, promises_1.readFile)(filePath).then(function (data) {
                try {
                    resolve(JSON.parse(data.toString()));
                }
                catch (error) {
                    console.log(error);
                    resolve(null);
                }
            }, function (e) {
                console.log(e);
                resolve(null);
            });
        }, function (e) {
            console.log(e);
            resolve(null);
        })
            .catch(function (e) {
            console.log(e);
            resolve(null);
        });
    });
}
exports.readJsonFile = readJsonFile;
function iWriteFile(filePath, data, override) {
    if (override) {
        return (0, promises_1.writeFile)(filePath, data);
    }
    return new Promise(function (resolve, reject) {
        (0, promises_1.access)(filePath).then(function () {
            console.log("".concat(filePath, " is exist, do not override"));
            resolve();
        }, function () {
            (0, promises_1.writeFile)(filePath, data).then(resolve, reject);
        });
    });
}
exports.iWriteFile = iWriteFile;
