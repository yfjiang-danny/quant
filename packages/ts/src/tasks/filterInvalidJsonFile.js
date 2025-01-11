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
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var promises_1 = require("fs/promises");
var p_limit_1 = require("p-limit");
var path_1 = require("path");
var paths_1 = require("../common/paths");
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var subFilePaths, limit_1, filePaths_1, filePathsPromises, invalidPaths_1, promises, _loop_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readdir)(paths_1.historyRootPath, { recursive: true })];
                case 1:
                    subFilePaths = _a.sent();
                    if (!subFilePaths || subFilePaths.length <= 0) {
                        console.log("Empty subFilePaths");
                        return [2 /*return*/];
                    }
                    limit_1 = (0, p_limit_1.default)(10);
                    filePaths_1 = [];
                    filePathsPromises = subFilePaths.map(function (subFilePath) {
                        return limit_1(function () {
                            return (0, promises_1.readdir)(path_1.default.resolve(paths_1.historyRootPath, subFilePath)).then(function (files) {
                                files.forEach(function (file) {
                                    filePaths_1.push(path_1.default.resolve(paths_1.historyRootPath, subFilePath, file));
                                });
                            }, function (e) {
                                console.log(e);
                            });
                        });
                    });
                    return [4 /*yield*/, Promise.allSettled(filePathsPromises)];
                case 2:
                    _a.sent();
                    invalidPaths_1 = [];
                    promises = filePaths_1.map(function (filePath) {
                        return limit_1(function () {
                            return (0, promises_1.readFile)(filePath)
                                .then(function (data) {
                                try {
                                    JSON.parse(data.toString());
                                }
                                catch (error) {
                                    invalidPaths_1.push(filePath);
                                }
                            }, function (e) {
                                console.log(e);
                            })
                                .catch(function (e) {
                                console.log(e);
                            });
                        });
                    });
                    return [4 /*yield*/, Promise.allSettled(promises)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path_1.default.resolve(paths_1.logRootPath, "invalid.json"), JSON.stringify(invalidPaths_1))];
                case 4:
                    _a.sent();
                    _loop_1 = function () {
                        var p, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    p = invalidPaths_1.shift();
                                    _b = p;
                                    if (!_b) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, promises_1.rm)(p)
                                            .then(function () {
                                            console.log("rm ".concat(p));
                                        }, function (e) {
                                            console.log(e);
                                        })
                                            .catch(function (e) {
                                            console.log(e);
                                        })];
                                case 1:
                                    _b = (_c.sent());
                                    _c.label = 2;
                                case 2:
                                    _b;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 5;
                case 5:
                    if (!(invalidPaths_1.length > 0)) return [3 /*break*/, 7];
                    return [5 /*yield**/, _loop_1()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
main();
