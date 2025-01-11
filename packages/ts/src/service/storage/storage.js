"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Storage = void 0;
var fs = require("fs");
var promises_1 = require("fs/promises");
var moment_1 = require("moment");
var p_limit_1 = require("p-limit");
var path_1 = require("path");
var paths_1 = require("../../common/paths");
var date_1 = require("../../utils/date");
var fs_1 = require("../../utils/fs");
var utils_1 = require("../utils");
var stockInfo_1 = require("../../db/interface/stockInfo");
var snapshot_1 = require("../../db/interface/snapshot");
var ladder_1 = require("../../db/interface/ladder");
var snapshot15_1 = require("../../db/interface/snapshot15");
var Storage;
(function (Storage) {
    function getAllBasicStocks(date) {
        return new Promise(function (resolve) {
            var dateStr = (0, date_1.findExistDate)(paths_1.allStockRootPath, date, ".json");
            if (!dateStr) {
                resolve({ data: [], msg: "Can not find data" });
                return;
            }
            var filePath = path_1.default.resolve(paths_1.allStockRootPath, "".concat(dateStr, ".json"));
            (0, fs_1.readJsonFile)(filePath).then(function (v) {
                resolve({ data: v || [] });
            }, function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getAllBasicStocks = getAllBasicStocks;
    function getStockInfosFromDB() {
        return new Promise(function (resolve, reject) {
            stockInfo_1.IStockInfoTable.getAllStocks()
                .then(function (res) {
                if (res && res.rows) {
                    resolve({ data: res.rows });
                }
                else {
                    resolve({ data: [] });
                }
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockInfosFromDB = getStockInfosFromDB;
    function getStockInfoBySymbol(symbol) {
        return new Promise(function (resolve, reject) {
            stockInfo_1.IStockInfoTable.getStockInfoBySymbol(symbol)
                .then(function (res) {
                if (res && res.rows) {
                    resolve({ data: res.rows[0] });
                }
                else {
                    resolve({ data: undefined });
                }
            }, function (e) {
                resolve({ data: undefined, msg: e });
            })
                .catch(function (e) {
                resolve({ data: undefined, msg: e });
            });
        });
    }
    Storage.getStockInfoBySymbol = getStockInfoBySymbol;
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
    function insertStockInfos(stocks) {
        return new Promise(function (resolve, reject) {
            stockInfo_1.IStockInfoTable.insert(stocks.map(function (v) {
                var nv = __assign({}, v);
                delete nv.ts_code;
                return nv;
            }))
                .then(function (res) {
                resolve({ data: true });
            }, function (e) {
                resolve({ data: false });
            })
                .catch(function (e) {
                resolve({ data: false });
            });
        });
    }
    Storage.insertStockInfos = insertStockInfos;
    /**
     * Get all stocks data with a specify date, default latest date.
     * @param date specify date
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
                    (0, fs_1.readJsonFileInBatch)(files.map(function (file) { return path_1.default.resolve(fileDir, file); })).then(function (res) {
                        resolve({ data: res.filter(function (v) { return !!v; }) });
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
    function saveStocks(stocks, override) {
        var _this = this;
        if (override === void 0) { override = false; }
        return new Promise(function (resolve) {
            var _a, _b;
            var invalidStocks = [];
            var newStocks = stocks === null || stocks === void 0 ? void 0 : stocks.filter(function (v) {
                var valid = v && v.date && v.symbol;
                if (!valid) {
                    invalidStocks.push(v);
                }
                return valid;
            });
            if (invalidStocks.length > 0) {
                console.log("Invalid stocks: ".concat(JSON.stringify(invalidStocks)));
            }
            if (!newStocks || newStocks.length <= 0) {
                resolve({ data: false, msg: "Empty list, nothing to save!" });
                return;
            }
            var arr = [];
            var i = 0, currentDate = (_a = newStocks[0]) === null || _a === void 0 ? void 0 : _a.date;
            while (i < newStocks.length) {
                var temp = [];
                while (i < newStocks.length) {
                    temp.push(__assign({}, newStocks[i]));
                    i++;
                    if (newStocks[i] &&
                        newStocks[i].date &&
                        newStocks[i].date != currentDate) {
                        break;
                    }
                }
                arr.push(temp);
                currentDate = (_b = newStocks[i]) === null || _b === void 0 ? void 0 : _b.date;
            }
            arr.forEach(function (s) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, saveStocksInOneDate(s, override)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            resolve({ data: true });
            // const limit = pLimit(2);
            // const promises = arr.map((v) =>
            //   limit(() => saveStocksInOneDate(v, override))
            // );
            // Promise.allSettled(promises).then(
            //   () => {
            //     resolve({ data: true });
            //   },
            //   (e) => {
            //     console.log(e);
            //     resolve({ data: false, msg: "Write file error" });
            //   }
            // );
        });
    }
    Storage.saveStocks = saveStocks;
    function saveStocksInOneDate(stocks, override) {
        if (override === void 0) { override = false; }
        return new Promise(function (resolve) {
            var invalidStocks = [];
            var newStocks = stocks === null || stocks === void 0 ? void 0 : stocks.filter(function (v) {
                var valid = v && v.date && v.symbol;
                if (!valid) {
                    invalidStocks.push(v);
                }
                return valid;
            });
            if (invalidStocks.length > 0) {
                console.log("Invalid stocks: ".concat(JSON.stringify(invalidStocks)));
            }
            if (!newStocks || newStocks.length <= 0) {
                resolve({ data: false, msg: "Empty list, nothing to save!" });
                return;
            }
            var dateStr = newStocks[0].date;
            var fileDir = path_1.default.resolve(paths_1.historyRootPath, dateStr);
            (0, fs_1.createDir)(fileDir).then(function () {
                var limit = (0, p_limit_1.default)(10);
                var promises = newStocks.map(function (v) {
                    return limit(function () {
                        return (0, fs_1.iWriteFile)(path_1.default.resolve(fileDir, "".concat(v.symbol, ".json")), JSON.stringify(v), override);
                    });
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
    Storage.saveStocksInOneDate = saveStocksInOneDate;
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
    function insertStockHistories(stocks, shouldUpdate) {
        return new Promise(function (resolve) {
            snapshot_1.IStockSnapshotTable.insert(stocks.map(function (v) {
                return (0, utils_1.convertToHistoryModel)(v);
            }), shouldUpdate)
                .then(function (res) {
                resolve({ data: true });
            }, function (e) {
                resolve({ data: false, msg: e });
            })
                .catch(function (e) {
                resolve({ data: false, msg: e });
            });
        });
    }
    Storage.insertStockHistories = insertStockHistories;
    function getStockHistories(symbol) {
        return new Promise(function (resolve) {
            (0, promises_1.readdir)(paths_1.historyRootPath)
                .then(function (dateStrings) {
                (0, fs_1.readJsonFileInBatch)(dateStrings.map(function (dateStr) {
                    return path_1.default.resolve(paths_1.historyRootPath, dateStr, "".concat(symbol, ".json"));
                })).then(function (res) {
                    resolve({
                        data: res
                            .filter(function (v) { return !!v && !!v.date; })
                            .sort(function (a, b) { return Number(b === null || b === void 0 ? void 0 : b.date) - Number(a === null || a === void 0 ? void 0 : a.date); }),
                    });
                });
            }, function (e) {
                console.log(e);
                resolve({ data: [] });
            })
                .catch(function () {
                resolve({ data: [] });
            });
        });
    }
    Storage.getStockHistories = getStockHistories;
    function getStockHistoriesFromDB(symbol, limit, offset) {
        return new Promise(function (resolve) {
            snapshot_1.IStockSnapshotTable.getStocksBySymbol(symbol, limit, offset)
                .then(function (res) {
                resolve({ data: res.rows });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockHistoriesFromDB = getStockHistoriesFromDB;
    function getStockSnapshotByDate(date) {
        if (!date) {
            date = (0, moment_1.default)().format("YYYYMMDD");
        }
        return new Promise(function (resolve) {
            snapshot_1.IStockSnapshotTable.getStocksByDate(date)
                .then(function (res) {
                resolve({ data: res.rows });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockSnapshotByDate = getStockSnapshotByDate;
    function getStockDetailsByDate(date) {
        if (!date) {
            date = (0, moment_1.default)().format("YYYYMMDD");
        }
        return new Promise(function (resolve) {
            snapshot_1.IStockSnapshotTable.getStockDetailsByDate(date)
                .then(function (res) {
                resolve({
                    data: res.rows,
                });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockDetailsByDate = getStockDetailsByDate;
    function updateStockHistories(stocks) {
        return new Promise(function (resolve) {
            snapshot_1.IStockSnapshotTable.update(stocks)
                .then(function (res) {
                resolve({ data: true });
            }, function (e) {
                resolve({ data: false, msg: e });
            })
                .catch(function (e) {
                resolve({ data: false, msg: e });
            });
        });
    }
    Storage.updateStockHistories = updateStockHistories;
    function insertStockTimeHistories(type, stocks, shouldUpdate) {
        return new Promise(function (resolve) {
            snapshot15_1.IStockTimeSnapshotTable.insert(type, stocks.map(function (v) {
                return (0, utils_1.convertToHistoryTimeModel)(v);
            }), shouldUpdate)
                .then(function (res) {
                resolve({ data: true });
            }, function (e) {
                resolve({ data: false, msg: e });
            })
                .catch(function (e) {
                resolve({ data: false, msg: e });
            });
        });
    }
    Storage.insertStockTimeHistories = insertStockTimeHistories;
    function getStockTimeHistories(type, symbol, limit, offset) {
        return new Promise(function (resolve) {
            snapshot15_1.IStockTimeSnapshotTable.getStocksBySymbol(type, symbol, limit, offset)
                .then(function (res) {
                resolve({
                    data: res.rows,
                });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockTimeHistories = getStockTimeHistories;
    function getStockTimeSnapshotByDate(type, date) {
        if (!date) {
            date = (0, moment_1.default)().format("YYYYMMDD");
        }
        return new Promise(function (resolve) {
            snapshot15_1.IStockTimeSnapshotTable.getStocksByDate(type, date)
                .then(function (res) {
                resolve({
                    data: res.rows,
                });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockTimeSnapshotByDate = getStockTimeSnapshotByDate;
    function getStockTimeDetailsByDate(type, date) {
        if (!date) {
            date = (0, moment_1.default)().format("YYYYMMDD");
        }
        return new Promise(function (resolve) {
            snapshot15_1.IStockTimeSnapshotTable.getStockDetailsByDate(type, date)
                .then(function (res) {
                resolve({
                    data: res.rows,
                });
            }, function (e) {
                resolve({ data: [], msg: e });
            })
                .catch(function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.getStockTimeDetailsByDate = getStockTimeDetailsByDate;
    /**
     *
     * @param stocks
     * @returns
     */
    function saveUpperLimitStocks(stocks) {
        return new Promise(function (resolve) {
            var findIndex = stocks.findIndex(function (v) { return !!v.date; });
            if (findIndex !== -1) {
                var date = stocks[findIndex].date; // YYYYMMdd
                var filePath = path_1.default.resolve(paths_1.upperLimitRootPath, "".concat(date, ".json"));
                (0, promises_1.writeFile)(filePath, JSON.stringify(stocks)).then(function () {
                    resolve({ data: true });
                }, function (e) {
                    console.log(e);
                    resolve({ data: false, msg: "Write file error!" });
                });
            }
            else {
                resolve({ data: false, msg: "Can't find date of stocks!" });
            }
        });
    }
    Storage.saveUpperLimitStocks = saveUpperLimitStocks;
    function getUpperLimitStocks(date) {
        return new Promise(function (resolve) {
            var latestDateStr = (0, date_1.findExistDate)(paths_1.upperLimitRootPath, date, ".json");
            if (!latestDateStr) {
                resolve({ data: null, msg: "Can not find latest data of ".concat(date) });
                return;
            }
            var filePath = path_1.default.resolve(paths_1.historyRootPath, "".concat(latestDateStr, ".json"));
            (0, fs_1.readJsonFile)(filePath).then(function (v) {
                resolve({ data: v });
            }, function (e) {
                resolve({ data: null, msg: e });
            });
        });
    }
    Storage.getUpperLimitStocks = getUpperLimitStocks;
    function queryUpperLimitStockSymbolByDates(dates) {
        return new Promise(function (resolve, reject) {
            ladder_1.IStockLadderTable.getStockLadderSymbolByDates(dates).then(function (res) {
                resolve({
                    data: res.rows.map(function (v) { return v.symbol; }),
                });
            }, function (e) {
                resolve({ data: [], msg: e });
            });
        });
    }
    Storage.queryUpperLimitStockSymbolByDates = queryUpperLimitStockSymbolByDates;
})(Storage || (exports.Storage = Storage = {}));
