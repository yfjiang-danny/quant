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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Excel = void 0;
var fs = __importStar(require("fs"));
var promises_1 = require("fs/promises");
var moment_1 = __importDefault(require("moment"));
var node_xlsx_1 = __importDefault(require("node-xlsx"));
var Excel;
(function (Excel) {
    function read(filePath) {
        return new Promise(function (resolve) {
            try {
                (0, promises_1.access)(filePath, fs.constants.F_OK).then(function () {
                    var sheets = node_xlsx_1.default.parse(filePath);
                    resolve(sheets);
                }, function (e) {
                    console.log(e);
                    resolve(null);
                });
            }
            catch (error) {
                console.log(error);
                resolve(null);
            }
        });
    }
    Excel.read = read;
    function write(data, filePath) {
        return new Promise(function (resolve) {
            try {
                var buffer = node_xlsx_1.default.build(data);
                fs.writeFile(filePath, buffer, function (err) {
                    if (err) {
                        console.log("Write failed: " + err);
                        resolve(false);
                    }
                    console.log("Write completed.");
                    resolve(true);
                });
            }
            catch (error) {
                console.log(error);
                resolve(false);
            }
        });
    }
    Excel.write = write;
    function append(data, filePath, before) {
        if (before === void 0) { before = false; }
        return new Promise(function (resolve) {
            try {
                if (!filePath) {
                    console.log("".concat(filePath, " do not exist"));
                    return false;
                }
                read(filePath).then(function (res) {
                    var newData = [];
                    if (res) {
                        var oldData = res.map(function (v) { return (__assign(__assign({}, v), { options: {} })); });
                        newData.push.apply(newData, oldData);
                        if (oldData.find(function (v) { return v.name === data.name; })) {
                            data.name += (0, moment_1.default)().format("hhmmss");
                        }
                        if (before) {
                            newData.unshift(data);
                        }
                        else {
                            newData.push(data);
                        }
                    }
                    else {
                        newData.push(data);
                    }
                    var buffer = node_xlsx_1.default.build(newData);
                    fs.writeFile(filePath, buffer, function (err) {
                        if (err) {
                            console.log("Write failed: " + err);
                            resolve(false);
                        }
                        console.log("Write completed.");
                        resolve(true);
                    });
                });
            }
            catch (error) {
                console.log(error);
                resolve(false);
            }
        });
    }
    Excel.append = append;
    function insertToExcel(_a) {
        var columns = _a.columns, data = _a.data, filePath = _a.filePath, sheetName = _a.sheetName, _b = _a.before, before = _b === void 0 ? true : _b;
        return __awaiter(this, void 0, void 0, function () {
            var rows, columnKeys, header, newSheet;
            return __generator(this, function (_c) {
                if (!filePath) {
                    console.log("filePath can not be null");
                    return [2 /*return*/, false];
                }
                rows = [];
                columnKeys = Object.keys(columns);
                rows.push(columnKeys);
                header = [];
                columnKeys.forEach(function (key) {
                    header.push(columns[key]);
                });
                rows.push(header);
                data.forEach(function (v) {
                    var row = [];
                    columnKeys.forEach(function (key, i) {
                        row.push(v[key] || "");
                    });
                    rows.push(row);
                });
                newSheet = {
                    name: sheetName || (0, moment_1.default)().format("YYYYMMDD"),
                    data: rows,
                    options: {},
                };
                return [2 /*return*/, append(newSheet, filePath, before)];
            });
        });
    }
    Excel.insertToExcel = insertToExcel;
})(Excel || (exports.Excel = Excel = {}));
