"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
var fs = __importStar(require("fs"));
var promises_1 = require("fs/promises");
var moment_1 = __importDefault(require("moment"));
var path_1 = __importDefault(require("path"));
var paths_1 = require("../common/paths");
var date_1 = require("../utils/date");
var fs_1 = require("../utils/fs");
var Storage;
(function (Storage) {
    function getAllBasicStocks(date) {
        return new Promise(function (resolve) {
            var dateStr = (0, date_1.findExistDate)(paths_1.allStockRootPath, date);
            if (!dateStr) {
                resolve({ data: [], msg: "Can not find data" });
                return;
            }
            (0, fs_1.readJsonFile)(path_1.default.resolve(paths_1.allStockRootPath, "".concat(date, ".json"))).then(function (v) {
                resolve({ data: v });
            }, function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getAllBasicStocks = getAllBasicStocks;
    function saveAllBasicStocks(stocks, dateString) {
        if (!dateString) {
            dateString = (0, moment_1.default)().format("YYYYMMDD");
        }
        return new Promise(function (resolve) {
            if (!stocks || stocks.length <= 0) {
                resolve({ data: false, msg: "Empty list, nothing to save" });
            }
            else {
                var filePath = path_1.default.resolve(paths_1.allStockRootPath, "".concat(dateString, ".json"));
                (0, promises_1.writeFile)(filePath, JSON.stringify(stocks)).then(function () {
                    resolve({ data: true });
                }, function (e) {
                    console.log(e);
                    resolve({ data: false, msg: "Write file error!" });
                });
            }
        });
    }
    Storage.saveAllBasicStocks = saveAllBasicStocks;
    /**
     *
     * @param date
     * @returns
     */
    function getAllStocks(date) {
        return new Promise(function (resolve) {
            var dateStr = (0, date_1.findExistDate)(paths_1.historyRootPath, date);
            if (!dateStr) {
                resolve({ data: [], msg: "Can not find data" });
                return;
            }
            var fileDir = path_1.default.resolve(paths_1.historyRootPath, dateStr);
            (0, promises_1.access)(fileDir, fs.constants.F_OK).then(function () {
                (0, promises_1.readdir)(fileDir).then(function (files) {
                    var promises = [];
                    files.forEach(function (file) {
                        return promises.push((0, fs_1.readJsonFile)(path_1.default.resolve(fileDir, file)));
                    });
                    Promise.allSettled(promises).then(function (res) {
                        var stocks = res.reduce(function (res, cur) {
                            if (cur.status === "fulfilled") {
                                cur.value && res.push(cur.value);
                            }
                            return res;
                        }, []);
                        resolve({
                            data: stocks,
                        });
                    }, function (e) {
                        console.log(e);
                        resolve({ data: [], msg: "File read error!" });
                    });
                }, function (e) {
                    console.log(e);
                    resolve({ data: [] });
                });
            }, function (e) {
                console.log(e);
                resolve({ data: [], msg: "File do not exist!" });
            });
        });
    }
    Storage.getAllStocks = getAllStocks;
    function saveStocks(stocks) {
        return new Promise(function (resolve) {
            var invalidStocks = [];
            var newStocks = stocks === null || stocks === void 0 ? void 0 : stocks.filter(function (v) {
                var valid = v.date && v.symbol;
                if (!valid) {
                    invalidStocks.push(v);
                }
                return valid;
            });
            if (invalidStocks.length > 0) {
                console.log("Invalid stocks: ".concat(JSON.stringify(invalidStocks)));
            }
            if (newStocks.length <= 0) {
                resolve({ data: false, msg: "Empty list, nothing to save!" });
                return;
            }
            var dateStr = newStocks[0].date;
            var fileDir = path_1.default.resolve(paths_1.historyRootPath, dateStr);
            (0, fs_1.createDir)(fileDir).then(function () {
                var promises = [];
                newStocks.forEach(function (v) {
                    var filePath = path_1.default.resolve(fileDir, "".concat(v.symbol, ".json"));
                    promises.push((0, promises_1.writeFile)(filePath, JSON.stringify(v)));
                });
                Promise.allSettled(promises).then(function (values) {
                    values.forEach(function (v) {
                        if (v.status === "rejected") {
                            console.log(v.reason);
                        }
                    });
                    resolve({ data: true });
                }, function (e) {
                    console.log(e);
                    resolve({ data: false, msg: "Write file error" });
                });
            }, function () {
                resolve({ data: false, msg: "Create ".concat(fileDir, " error!") });
            });
        });
    }
    Storage.saveStocks = saveStocks;
    function saveStock(stock) {
        return new Promise(function (resolve) {
            if (!stock) {
                resolve({ data: false, msg: "Stock info is empty, nothing to save" });
            }
            else {
                var dateStr = stock.date;
                var symbol = stock.symbol;
                if (!dateStr || !symbol) {
                    console.log("Invalid stock ".concat(JSON.stringify(stock)));
                    resolve({ data: false, msg: "Invalid stock, nothing to save" });
                }
                else {
                    var fileDir_1 = path_1.default.resolve(paths_1.historyRootPath, dateStr);
                    var filePath_1 = path_1.default.resolve(fileDir_1, "".concat(symbol, ".json"));
                    (0, fs_1.createDir)(fileDir_1).then(function () {
                        (0, promises_1.writeFile)(filePath_1, JSON.stringify(stock)).then(function () {
                            resolve({ data: true });
                        }, function (e) {
                            console.log(e);
                            resolve({ data: false, msg: "Write file error!" });
                        });
                    }, function (e) {
                        console.log(e);
                        resolve({ data: false, msg: "Create ".concat(fileDir_1, " error!") });
                    });
                }
            }
        });
    }
    Storage.saveStock = saveStock;
    function getStock(symbol, date) {
        return new Promise(function (resolve) {
            var latestDateStr = (0, date_1.findExistDate)(paths_1.historyRootPath, date);
            if (!latestDateStr) {
                resolve({ data: null, msg: "Can not find latest data of ".concat(date) });
                return;
            }
            var filePath = path_1.default.resolve(paths_1.historyRootPath, latestDateStr, "".concat(symbol, ".json"));
            (0, fs_1.readJsonFile)(filePath).then(function (v) {
                resolve({ data: v });
            }, function (e) {
                resolve({ data: null, msg: e });
            });
        });
    }
    Storage.getStock = getStock;
    function getStockHistories(symbol) {
        return new Promise(function (resolve) {
            (0, promises_1.readdir)(paths_1.historyRootPath).then(function (dateStrings) {
                var promises = [];
                dateStrings.forEach(function (dateStr) {
                    return (0, fs_1.readJsonFile)(path_1.default.resolve(paths_1.historyRootPath, dateStr, "".concat(symbol, ".json")));
                });
                Promise.allSettled(promises).then(function (res) {
                    var stocks = res.reduce(function (res, cur) {
                        if (cur.status === "fulfilled" && cur.value) {
                            if (!res.find(function (v) { var _a; return v.date == ((_a = cur.value) === null || _a === void 0 ? void 0 : _a.date); })) {
                                res.push(cur.value);
                            }
                        }
                        return res;
                    }, []);
                    resolve({
                        data: stocks,
                    });
                }, function (e) {
                    console.log(e);
                    resolve({ data: [], msg: "File read error!" });
                });
            }, function (e) {
                console.log(e);
                resolve({ data: [] });
            });
        });
    }
    Storage.getStockHistories = getStockHistories;
})(Storage || (exports.Storage = Storage = {}));
