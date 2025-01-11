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
exports.dbQuery = void 0;
var pg_1 = require("pg");
var dotenv = require("dotenv");
var logs_1 = require("../logs");
dotenv.config();
var dbConfig = {
    host: process.env.POSTGRES_HOST, // Replace with your PostgreSQL server hostname/IP
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB, // Replace with your database name
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    connectionTimeoutMillis: 1000 * 60 * 1,
    query_timeout: 1000 * 60 * 5,
};
var pool = new pg_1.Pool(dbConfig);
// Function to connect to the database (using connection pool)
function connect() {
    return __awaiter(this, void 0, void 0, function () {
        var con;
        return __generator(this, function (_a) {
            try {
                con = pool.connect();
                // console.log("Connected to PostgreSQL database");
                return [2 /*return*/, con];
            }
            catch (err) {
                console.error("Connection error:", err);
                throw err; // Re-throw to handle in the calling function
            }
            return [2 /*return*/];
        });
    });
}
// Function to execute a query
function dbQuery(query) {
    return __awaiter(this, void 0, void 0, function () {
        var client, result, i, element, res, error_1, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, connect()];
                case 1:
                    client = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 16, 17, 18]);
                    if (!(Array.isArray(query) && query.length > 0)) return [3 /*break*/, 14];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 11, , 13]);
                    return [4 /*yield*/, client.query(query[0].text, query[0].values)];
                case 4:
                    result = _b.sent();
                    return [4 /*yield*/, client.query("BEGIN")];
                case 5:
                    _b.sent();
                    i = 1;
                    _b.label = 6;
                case 6:
                    if (!(i < query.length)) return [3 /*break*/, 9];
                    element = query[i];
                    return [4 /*yield*/, client.query(element.text, element.values)];
                case 7:
                    res = _b.sent();
                    if (result.rowCount && res.rowCount) {
                        result.rowCount += res.rowCount;
                    }
                    (_a = result.rows).push.apply(_a, res.rows);
                    _b.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, client.query("COMMIT")];
                case 10:
                    _b.sent();
                    return [2 /*return*/, result];
                case 11:
                    error_1 = _b.sent();
                    return [4 /*yield*/, client.query("ROLLBACK")];
                case 12:
                    _b.sent();
                    throw error_1;
                case 13: return [3 /*break*/, 15];
                case 14: return [2 /*return*/, client.query(query.text, query.values)];
                case 15: return [3 /*break*/, 18];
                case 16:
                    err_1 = _b.sent();
                    logs_1.logger.info("Query error:" + err_1);
                    throw err_1; // Re-throw to handle in the calling function
                case 17:
                    client.release(); // Release the client back to the pool
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
exports.dbQuery = dbQuery;
