"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
var Queue = /** @class */ (function () {
    function Queue() {
        var _this = this;
        this.exec = function (task, done) {
            done();
        };
        this.add = function (data) {
            _this.tasks.push({ data: data });
            if (_this.tasks.length === 1) {
                _this.runNext();
            }
        };
        this.runNext = function () {
            if (_this.tasks.length === 0) {
                return;
            }
            var task = _this.tasks[0];
            _this.exec(task, _this.done);
        };
        this.done = function () {
            _this.tasks.shift();
            _this.runNext();
        };
        this.process = function (fn) {
            _this.exec = fn;
        };
        this.tasks = [];
    }
    return Queue;
}());
exports.Queue = Queue;
