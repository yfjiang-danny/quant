import * as dotenv from "dotenv";

import { collectFactor } from "../collection/factor";
dotenv.config();

(async function main() {
  await collectFactor("20250519").then();
})();
