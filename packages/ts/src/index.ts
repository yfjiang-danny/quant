import * as dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { ALPH_API } from "./alph/api";
import { genRandomEmail, genRandomText } from "./utils/email";
dotenv.config();

(async function main() {
  // ALPH_API.createToken({
  //   organization_text: genRandomText(4),
  //   email_text: genRandomEmail(),
  // }).then((token) => {
  //   console.log(token);
  // });
})();
