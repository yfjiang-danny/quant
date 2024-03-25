import * as dotenv from "dotenv";
import { readdir } from "fs/promises";
import { historyRootPath, logRootPath } from "../common/paths";
import { Storage } from "../service/storage/storage";
import path from "path";
import { logger } from "../logs";
dotenv.config();

const logPath = path.resolve(logRootPath, "files_to_db.log");

(async function main() {
    const subFilePaths = await readdir(historyRootPath, { recursive: true });

    logger.info(`Start...`, logPath)
    let i = 0;
    while (i < subFilePaths.length) {
        const stocks = await Storage.getAllStocks(subFilePaths[i]).then(res => res.data);
        if (!stocks || stocks.length <= 0) {
            logger.info(`Folder ${subFilePaths[i]} is empty`, logPath)
        } else {
            await Storage.insertStockHistories(stocks, true)
        }
        i++
    }
    logger.info(`Completed`, logPath)
    
})()