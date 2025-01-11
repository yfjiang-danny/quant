"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
var Queue = /** @class */ (function () {
    function Queue() {
        var _this_1 = this;
        this.exec = function (task, done) {
            done();
        };
        this.add = function (data, executor) {
            var _this = _this_1;
            _this.tasks.push({ data: data, executor: executor });
            if (_this.tasks.length === 1) {
                _this.runNext();
            }
        };
        this.runNext = function () {
            var _a;
            var _this = _this_1;
            if (_this.tasks.length === 0) {
                (_a = _this.last) === null || _a === void 0 ? void 0 : _a.call(_this);
                return;
            }
            var task = _this.tasks[0];
            if (task.executor) {
                task.executor(task, _this.done);
            }
            else {
                _this.exec(task, _this.done);
            }
        };
        this.done = function () {
            var _this = _this_1;
            _this.tasks.shift();
            _this.runNext();
        };
        this.process = function (fn) {
            var _this = _this_1;
            _this.exec = fn;
        };
        this.setLast = function (fn) {
            var _this = _this_1;
            _this.last = fn;
        };
        this.tasks = [];
    }
    return Queue;
}());
exports.Queue = Queue;
