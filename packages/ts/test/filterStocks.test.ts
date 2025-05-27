import * as dotenv from "dotenv";
import { Mailer163 } from "../src/mail";
import { filterStocks } from "../src/tasks/filterStocks";

dotenv.config();

(async function test() {
  const mailer = new Mailer163();
  await filterStocks(undefined, mailer, "20250527");
})();
