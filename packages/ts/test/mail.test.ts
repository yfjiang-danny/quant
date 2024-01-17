import { Mailer163 } from "../src/mail";

import * as dotenv from "dotenv";

dotenv.config();

(function test() {
  const mailer = new Mailer163();
  mailer
    .send({
      to: process.env.MAIL_USER_NAME || "", // list of receivers
      subject: "Hello", // Subject line
      text: "test", // plain text body
    })
    .then((res: any) => {
      console.log(res);
    });
})();
