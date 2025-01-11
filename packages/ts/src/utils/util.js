"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopyWithJson = void 0;
function deepCopyWithJson(data) {
    try {
        return JSON.parse(JSON.stringify(data));
    }
    catch (error) {
        return data;
    }
}
exports.deepCopyWithJson = deepCopyWithJson;
