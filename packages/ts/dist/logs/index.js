"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var promises_1 = require("fs/promises");
var moment_1 = __importDefault(require("moment"));
var path_1 = __importDefault(require("path"));
var queue_1 = require("../utils/queue");
/**
 *
 */
var Logger = /** @class */ (function () {
    function Logger(filePath) {
        if (!filePath) {
            this.filePath = path_1.default.resolve(__dirname, "quant.log");
        }
        else {
            this.filePath = filePath;
        }
        var file = this.filePath;
        this.queue = new queue_1.Queue();
        this.queue.process(function (job, done) {
            (0, promises_1.appendFile)(file, JSON.stringify(job.data)).then(function () {
                //
                done();
            }, function (err) {
                console.log(err);
                done();
            });
        });
    }
    Logger.prototype.info = function (msg) {
        this.queue.add({
            time: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:SS"),
            message: msg,
        });
    };
    return Logger;
}());
// Logger
exports.logger = new Logger();
