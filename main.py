# main.py

import backtrader as bt
import datetime as dt

class MovingAverageCrossStrategy(bt.Strategy):
    params = (
        ("short_period", 10),
        ("long_period", 50),
    )

    def __init__(self):
        self.short_ma = bt.indicators.SimpleMovingAverage(self.data.close, period=self.params.short_period)
        self.long_ma = bt.indicators.SimpleMovingAverage(self.data.close, period=self.params.long_period)

    def next(self):
        if self.short_ma > self.long_ma and self.position.size == 0:
            # 短期均线上穿长期均线，产生买入信号
            self.buy()

        elif self.short_ma < self.long_ma and self.position.size > 0:
            # 短期均线下穿长期均线，产生卖出信号
            self.sell()

if __name__ == '__main__':
    # 创建 Backtrader 引擎
    cerebro = bt.Cerebro(writer=True)

    # 加载数据（这里使用 Yahoo Finance 数据作为示例）
    data = bt.feeds.YahooFinanceData(dataname='./300750.SZ.csv',
                                     fromdate=dt.datetime(2023, 1, 1),
                                     todate=dt.datetime(2023, 12, 15))
    cerebro.adddata(data, '300750.SZ')

    # 添加策略
    cerebro.addstrategy(MovingAverageCrossStrategy)

    # 设置初始资金
    cerebro.broker.set_cash(100000)

    # 设置手续费
    cerebro.broker.setcommission(commission=0.001)

    # 运行回测
    cerebro.run()

    # 可视化回测结果
    cerebro.plot(style='candlestick')  # 根据你的需要选择图表样式
