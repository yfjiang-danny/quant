# get_stock_data.py

import yfinance as yf

def get_stock_data(symbol):
    # 创建 Ticker 对象
    ticker = yf.Ticker(symbol)

    # 获取公司信息
    info = ticker.info

    # 提取市值信息
    market_cap = info.get('marketCap', 'N/A')

    # 打印市值信息
    print(f"The market cap of {symbol} is: {market_cap}")

    # 打印其他基本面信息
    print("Other fundamental data:")
    for key, value in info.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    stock_symbol = 'AAPL'
    get_stock_data(stock_symbol)
