import * as dotenv from "dotenv";
import { Mailer163 } from "../src/mail";
import { filterCurrent } from "../src/tasks/filterCurrent";

dotenv.config();

(async function test() {
  const mailer = new Mailer163();
  await filterCurrent(undefined, mailer);
})();
