import * as dotenv from "dotenv";
import { Queue } from "../../utils/queue";
import { TUSHARE_API } from "../tushare/api";
import { Storage } from "../storage/storage";
import { fillEastStockInfo } from "../utils";
import { Mailer163 } from "../../mail";

dotenv.config();

const queue = new Queue();

async function stockInfo() {
    const allBasicStocks = await TUSHARE_API.getAllStock();
    if (allBasicStocks && allBasicStocks.length>0) {
        const res = await Storage.insertStockInfos(allBasicStocks)
        if (!res.data) {
            console.log(`Update stock info failed: ${res.msg}`);
        } else {
            console.log(`Update stock info success`);
        }
    } else {
        console.log(`Update stock info failed: TUSHARE_API.getAllStock is null`);
    }
}

async function dailyInfo() {
    const allBasicStocks = await Storage.getStockInfosFromDB()
    if (!allBasicStocks.data || allBasicStocks.data.length === 0) {
        console.log(`Update daily info failed: empty basic stocks, ${allBasicStocks.msg}`);
        return
    }

    const dailyStocks = await fillEastStockInfo(allBasicStocks.data)

    if(!dailyStocks || dailyStocks.length ==0) {
        console.log(`Update daily info failed: empty daily stocks`);
        return
    }

    const res = await Storage.insertStockHistories(dailyStocks);

    if (res.data) {
        console.log(`Update daily info success`);
    } else {
        console.log(`Update daily info failed: ${res.msg}`);
    }
}

export function dailyCollection(mailer?: Mailer163) {
    queue.process(({ data }, done) => {
        if (typeof data === "function") {
            const res = data();
            if (res && typeof res.then === "function") {
                res.then(() => {
                    done();
                }, () => {
                    done();
                })
            } else {
                done();
            }
        } else {
            done()
        }
    })
    queue.add(stockInfo)
    queue.add(dailyInfo)

    while (queue.tasks.length === 0) {
        console.log('Daily collection complete');
        break;
    }

    mailer
    ?.send({
      to: "michael593@163.com",
      subject: "collection",
      text: `Daily Collection Task completed`,
    })
    .then((res) => {
      //
    })
    .catch((e) => {
      //
    });
}