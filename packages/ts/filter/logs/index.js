"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var promises_1 = require("fs/promises");
var moment_1 = __importDefault(require("moment"));
var path_1 = __importDefault(require("path"));
var paths_1 = require("../common/paths");
var queue_1 = require("../utils/queue");
/**
 *
 */
var Logger = /** @class */ (function () {
    function Logger(filePath) {
        var _this_1 = this;
        this.setFilePath = function (filePath) {
            _this_1.filePath = filePath;
        };
        this.info = function (msg, output) {
            _this_1.queue.add({
                time: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:SS"),
                message: msg,
                output: output,
            });
        };
        if (!filePath) {
            this.filePath = path_1.default.resolve(paths_1.logRootPath, "quant.log");
        }
        else {
            this.filePath = filePath;
        }
        var _this = this;
        this.queue = new queue_1.Queue();
        this.queue.process(function (job, done) {
            var file = job.data.output || _this.filePath;
            delete job.data.output;
            if (file) {
                (0, promises_1.appendFile)(file, JSON.stringify(job.data) + "\n").then(function () {
                    //
                    done();
                }, function (err) {
                    console.log(err);
                    done();
                });
            }
            else {
                console.log("Logger ".concat(file, " do not exist"));
            }
        });
    }
    return Logger;
}());
// Logger
exports.logger = new Logger();
