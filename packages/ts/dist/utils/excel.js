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
exports.Excel = void 0;
var fs = __importStar(require("fs"));
var node_xlsx_1 = __importDefault(require("node-xlsx"));
var Excel;
(function (Excel) {
    function read(filePath) {
        return new Promise(function (resolve) {
            try {
                var sheets = node_xlsx_1.default.parse(filePath);
                resolve(sheets);
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
})(Excel || (exports.Excel = Excel = {}));
