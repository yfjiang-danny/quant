"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer163 = void 0;
var nodemailer_1 = require("nodemailer");
var Mailer163 = /** @class */ (function () {
    function Mailer163() {
        var userName = process.env.QQ_MAIL_USER_NAME;
        var password = process.env.QQ_MAIL_PASSWORD;
        this.transporter = (0, nodemailer_1.createTransport)({
            host: "smtp.qq.com",
            port: 465,
            secure: true,
            auth: {
                user: userName,
                pass: password,
            },
        });
    }
    Mailer163.prototype.send = function (_a) {
        var _b;
        var _c = _a.from, from = _c === void 0 ? process.env.QQ_MAIL_USER_NAME : _c, _d = _a.to, to = _d === void 0 ? process.env.MAIL_USER_NAME : _d, subject = _a.subject, text = _a.text, html = _a.html, attachments = _a.attachments;
        var _this = this;
        return (_b = _this.transporter) === null || _b === void 0 ? void 0 : _b.sendMail({
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            attachments: attachments,
        });
    };
    return Mailer163;
}());
exports.Mailer163 = Mailer163;
