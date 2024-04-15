import axios, { AxiosRequestConfig } from "axios";
import csvtojson from "csvtojson";
import path from "path";
import querystring from "querystring";
import { SocksProxyAgent } from "socks-proxy-agent";
import { logRootPath } from "../../common/paths";
import { logger } from "../../logs";

export namespace YAHOO_API {
  const logPath = path.resolve(logRootPath, "yahoo.log");
  const socksAgent = new SocksProxyAgent("socks5://127.0.0.1:51837");

  function log(msg: unknown) {
    logger.info(msg, logPath);
  }

  let yahooReject = false;

  function get(url: string, options?: AxiosRequestConfig) {
    if (yahooReject) {
      return new Promise<null>((resolve, reject) => {
        resolve(null);
      });
    }
    return axios
      .get(url, {
        ...options,
        headers: {
          ...options?.headers,
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        httpAgent: socksAgent,
        httpsAgent: socksAgent,
      })
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        yahooReject = true;
        log(e);
        return null;
      });
  }

  export function getHistoryPage(symbol: string, market: string) {
    // https://finance.yahoo.com/quote/000001.SZ/history
    return get(`https://finance.yahoo.com/quote/${symbol}.${market}/history`)
      .then((res) => {
        log(res);
      })
      .catch((e) => {
        log(e);
      });
  }

  async function getCrumb(url: string, retries: number = 3) {
    let crumb = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await get(url);

        // Check if the response status code is OK
        if (!response) {
          continue;
        }

        const txt = response;

        // Find the position of 'CrumbStore' in the response text
        let index = txt.indexOf("CrumbStore");
        if (index === -1) {
          continue;
        }

        // Find the position of 'crumb' after 'CrumbStore'
        index = txt.indexOf("crumb", index);
        if (index === -1) {
          continue;
        }

        // Find the starting and ending positions of the crumb value
        let istart = txt.indexOf('"', index + "crumb".length + 1);
        if (istart === -1) {
          continue;
        }
        istart += 1;

        const iend = txt.indexOf('"', istart);
        if (iend === -1) {
          continue;
        }

        // Extract the crumb value
        crumb = txt.substring(istart, iend);
        crumb = crumb.replace(/\\u[\dA-Fa-f]{4}/g, (match: string) =>
          String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
        );

        break;
      } catch (error) {
        // Handle errors or retry logic if needed
        log(error);
      }
    }

    if (crumb === null) {
      log("Crumb not found");
      return null;
    }

    // URL encode the crumb value
    crumb = querystring.escape(crumb);

    return crumb;
  }

  export function getStockHistory(symbol: string, market: string) {
    // https://query1.finance.yahoo.com/v7/finance/download/ticker?period1=posix1&period2=posix2&interval=1d&events=history&crumb=crumb
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}.${market}?period1=${new Date(
      "2014-01-01"
    )
      .getTime()
      .toString()
      .substring(0, 10)}&period2=${Date.now()
      .toString()
      .substring(0, 10)}&interval=1d&events=history&includeAdjustedClose=true`;
    return downloadAndConvertCSV(url);
  }

  async function downloadAndConvertCSV(url: string) {
    try {
      // 发送 GET 请求获取 CSV 文件
      const response = await get(url, { responseType: "stream" });

      // 创建一个可读流
      const csvStream = response;

      if (!csvStream) {
        return null;
      }

      // 将 CSV 流转换成 JSON 流
      return new Promise<unknown[]>((resolve) => {
        const res: unknown[] = [];
        csvtojson()
          .fromStream(csvStream)
          .subscribe((json) => {
            // 处理每行转换后的 JSON 数据
            res.push(json);
          })
          .on("done", () => {
            log(`${url}`);
            resolve(res);
            log("CSV to JSON conversion completed.");
          });
      });
    } catch (error) {
      log(error);
      return null;
    }
  }
}
