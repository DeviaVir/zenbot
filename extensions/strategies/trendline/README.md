
## Reading the console output

![console](Capture.PNG)

From left to right ( for trendline not pictured above, which is neural ):

- Timestamp in local time (grey, blue when showing "live" stats)
- Asset price in currency (yellow)
- Percent change of price since last period (red/green)
- Volume in asset since last period (grey)
- [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) ANSI graph (red/green)
- strategy inormation, in order:
```
- col1: trendline 10000/1000 trades 
- col2: trendline 1000/100 trades 
- col3:stdev of 10000 trades
- col4: stdev of 1000 trades
- col5: 10000trades mean
- col6: 1000 trades mean
- col7: the mean of the 10000 & 1000 trades and stdev calculated into 100* the stdev percentage of the mean of the long and short trades (in short the active-markup based on a multiplier to create a percentage of standard deviation.) 
- If the four cols on the right are green, that means its a currently increasing trend) when both on the left are green both trends are increasing)
```
- Current signal or action, including `buy`, `sell`, `buying`, `selling`, `bought`, `sold` and `last_trade_worth` (percent change in the trend direction since last buy/sell)
- Account balance (asset)
- Account balance (currency)
- Profit or loss percent (can be reset with `--reset_profit`)
- Gain or loss vs. buy/hold strategy

