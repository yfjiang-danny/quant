import moment from "moment";
import { Storage } from "../service/storage/storage";

async function genReport(date?: string) {
    date = date??moment().format('YYYYMMDD');
    const allStocks = await Storage.getStockSnapshotByDate(date).then(res => res.data);


    if (!allStocks || allStocks.length === 0) {
        return 
    }

    let totalVolume = 0, numOfPositive = 0, numOfNegative = 0;

    for (const stock of allStocks) {
        if (!isNaN(Number(stock.volume))) {
            totalVolume += Number(stock.volume);
        }
        if (Number(stock.close) > Number(stock.open)) {
            
        }
    }

}