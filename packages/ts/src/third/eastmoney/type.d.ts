export type MarketType = "SZ" | "SH" | "OC";

interface QuoteSnapshotModel {
  code: string;
  name: string;
  sname: string;
  transType: number;
  topprice: string; // 涨停价
  bottomprice: string; // 跌停价
  status: number;
  fivequote: {
    yesClosePrice: string;
    openPrice: string;
    sale1: string;
    sale2: string;
    sale3: string;
    sale4: string;
    sale5: string;
    buy1: string;
    buy2: string;
    buy3: string;
    buy4: string;
    buy5: string;
    sale1_count: number;
    sale2_count: number; //22;
    sale3_count: number; //27;
    sale4_count: number; //76;
    sale5_count: number; //25;
    buy1_count: number; //14;
    buy2_count: number; //51;
    buy3_count: number; //84;
    buy4_count: number; //183;
    buy5_count: number; //39;
  };
  realtimequote: {
    open: string;
    high: string;
    low: string;
    avg: string;
    zd: string; //"-0.37";
    zdf: string; //"-2.53%"; 涨跌幅
    turnover: string; //"5.28%"; 换手率
    currentPrice: string; //"14.28";
    volume: string; //"63064";
    amount: string; //"90342443";
    wp: string; //"30773";
    np: string; //"32292";
    time: string; //"15:34:45";
    date: string; //"20240104";
  };
  tradeperiod: number; //6;
}

/**
 * change 涨跌 | turnover 换手率 | volume 总手 |
 *
 */
export interface EastMoneyStockModel {
  code?: string;
  name?: string;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  date?: string;
  time?: string;
  volume?: number;
  change?: string;
  capital?: number;
  turnover?: number;
  avg?: number;
  topPrice?: number;
  bottomPrice?: number;
  external?: string;
  internal?: string;
  sale1?: string;
  sale2?: string;
  buy1?: string;
  buy2?: string;
  buy1_count?: number;
  buy2_count?: number;
  sale1_count?: number;
  sale2_count?: number;
}

/**
 * K 线响应
 * f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61
 * date,open,close,high,low,总手,成交额,振幅,涨跌幅,涨跌,换手率
 * 2025-05-23,19.70,21.90,24.38,19.70,213653,473163731.20,24.57,14.96,2.85,32.11
 */
interface EastMoneyStockKLineResponseModel {
  rc: number; //0,
  rt: number; //17,
  svr: number; //181669690,
  lt: number; //1,
  full: number; //0,
  dlmkts: string; //"",
  data: {
    code: string; //"002735",
    market: number; //0,
    name: string; // "王子新材",
    decimal: number; //2,
    dktotal: number; //2319,
    preKPrice: number; //2.42,
    klines: string[];
  };
}

/**
 * 资金流向
 */
interface CapitalFlowResponseModel {
  rc: number; //0,
  rt: number; //11,
  svr: number; //180606409,
  lt: number; //1,
  full: number; //1,
  dlmkts: string; //"",
  data: {
    total: number; //1,
    diff: [
      {
        f6: number; //2509481114.54,
        f62: number; //93752992.0, // 主力净流入
        f64: number; //556867328.0, 超大单流入
        f65: number; //469632352.0, 超大单流出
        f66: number; //87234976.0, 超大单净流入
        f69: number; //3.48, 超大单净比
        f70: number; //640597888.0, 大单流入
        f71: number; //634079872.0, 大单流出
        f72: number; //6518016.0, 大单净流入
        f75: number; //0.26, 大单净比
        f76: number; //708613696.0, 中单流入
        f77: number; //739852304.0, 中单流出
        f78: number; //-31238608.0, 中单净流入
        f81: number; //-1.24, 中单净比
        f82: number; //566140336.0, 小单流入
        f83: number; //628654720.0, 小单流出
        f84: number; //-62514384.0, 中单净流入
        f87: number; //-2.49, 小单净比
        f124: number; //1735284882,
        f164: number; //492604592.0,
        f166: number; //305985104.0,
        f168: number; //186619488.0,
        f170: number; //-400426512.0,
        f172: number; //-92178080.0,
        f184: number; //3.74, 主力净比
        f252: number; //1669446914.0,
        f253: number; //1243503202.0,
        f254: number; //425943712.0,
        f255: number; //-1380302368.0,
        f256: number; //-289144688.0,
        f278: number; //492604592.0,
        f279: number; //305985104.0,
        f280: number; //186619488.0,
        f281: number; //-400426512.0,
        f282: number; //-92178080.0
      }
    ];
  };
}
