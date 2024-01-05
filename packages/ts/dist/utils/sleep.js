"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
function sleep(milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
}
exports.sleep = sleep;
