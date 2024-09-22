import { isHoliday } from "chinese-calendar-ts";
import moment from "moment";
import { Mailer163 } from "../mail";
import { Storage } from "../service/storage/storage";

const ColumnMap: Record<string, string> = {
  totalVolume: "总成交量",
  numOfPositive: "上涨数",
  numOfNegative: "下跌数",
  reachTop: "触及涨停",
  reachBottom: "触及跌停",
  topLimitted: "涨停数",
  bottomLimitted: "跌停数",
  median: "中位数",
  between0And1: "0<=1",
  between1And5: "1<=5",
  moreThan5: "5<",
  between0And1Negative: "-1<=0",
  between1And5Negative: "-5<=-1",
  moreThan5Negative: "<=-5",
};

export async function genReport(date?: string, mail?: Mailer163) {
  if (isHoliday(new Date())) {
    return;
  }
  date = date ?? moment().format("YYYYMMDD");
  const allStocks = await Storage.getStockDetailsByDate(date).then(
    (res) => res.data
  );

  if (!allStocks || allStocks.length === 0) {
    return;
  }

  const stocks = allStocks
    .map((v) => {
      return {
        ...v,
        changePercentage: Number(
          (Number(v.change) / (Number(v.close) - Number(v.change))).toFixed(4)
        ),
      };
    })
    .sort((a, b) => b.changePercentage - a.changePercentage);

  let totalVolume = 0,
    numOfPositive = 0,
    numOfNegative = 0,
    reachTop = 0,
    reachBottom = 0,
    topLimitted = 0,
    bottomLimitted = 0,
    between0And1 = 0,
    between1And5 = 0,
    moreThan5 = 0,
    between0And1Negative = 0,
    between1And5Negative = 0,
    moreThan5Negative = 0;

  for (const stock of stocks) {
    if (!isNaN(Number(stock.volume))) {
      totalVolume += Number(stock.volume);
    }
    if (Number(stock.close) > Number(stock.open)) {
      numOfPositive++;
    } else if (Number(stock.close) < Number(stock.open)) {
      numOfNegative++;
    }
    if (Number(stock.high) === Number(stock.top_price)) {
      reachTop++;
    }
    if (Number(stock.low) === Number(stock.bottom_price)) {
      reachBottom++;
    }
    if (Number(stock.close) === Number(stock.top_price)) {
      topLimitted++;
    }
    if (Number(stock.close) === Number(stock.bottom_price)) {
      bottomLimitted++;
    }
    const changePercentage = stock.changePercentage;
    if (!isNaN(changePercentage)) {
      if (changePercentage > 0 && changePercentage <= 0.01) {
        between0And1++;
      } else if (changePercentage > 0.01 && changePercentage <= 0.05) {
        between1And5++;
      } else if (changePercentage > 0.05) {
        moreThan5++;
      } else if (changePercentage <= 0 && changePercentage > -0.01) {
        between0And1Negative++;
      } else if (changePercentage <= -0.01 && changePercentage > -0.05) {
        between1And5Negative++;
      } else {
        moreThan5Negative++;
      }
    }
  }

  let median = 0;
  if (stocks.length % 2 === 0) {
    median = stocks[Math.round(stocks.length / 2)].changePercentage;
  } else {
    median = Number(
      (
        (stocks[Math.round(stocks.length / 2)].changePercentage +
          stocks[Math.round(stocks.length / 2) - 1].changePercentage) /
        2
      ).toFixed(4)
    );
  }

  const result: Record<string, number | string> = {
    totalVolume,
    numOfPositive,
    numOfNegative,
    reachTop,
    reachBottom,
    topLimitted,
    bottomLimitted,
    median: (median * 100).toString() + "%",
    between0And1,
    between1And5,
    moreThan5,
    between0And1Negative,
    between1And5Negative,
    moreThan5Negative,
  };

  let htmlStr = "";

  for (const key in ColumnMap) {
    if (Object.prototype.hasOwnProperty.call(ColumnMap, key)) {
      htmlStr += "<br />";
      htmlStr += ColumnMap[key];
      htmlStr += "：";
      htmlStr += result[key];
    }
  }

  if (mail) {
    mail.send({
      subject: "市场概览",
      html: htmlStr,
    });
  }

  return htmlStr;
}
