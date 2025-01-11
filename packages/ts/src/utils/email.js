"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genRandomEmail = exports.genRandomText = void 0;
function genRandomText(len) {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";
    for (var i = 0; i < len; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        text += characters[randomIndex];
    }
    return text;
}
exports.genRandomText = genRandomText;
function genRandomEmail() {
    var suffix = "@163.com";
    var prefix = genRandomText(6);
    return "".concat(prefix).concat(suffix);
}
exports.genRandomEmail = genRandomEmail;
