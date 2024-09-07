"use strict";

import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export class Mailer163 {
  transporter: any;

  constructor() {
    const userName = process.env.QQ_MAIL_USER_NAME;
    const password = process.env.QQ_MAIL_PASSWORD;

    this.transporter = createTransport({
      host: "smtp.qq.com",
      port: 465,
      secure: true,
      auth: {
        user: userName,
        pass: password,
      },
    });
  }

  send({
    from = process.env.QQ_MAIL_USER_NAME,
    to = process.env.MAIL_USER_NAME,
    subject,
    text,
    html,
    attachments,
  }: Mail.Options): Promise<unknown> {
    const _this = this;
    return _this.transporter?.sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
      attachments: attachments,
    });
  }
}
