var c = module.exports = {}

c.selector = 'bittrex.ZEC-BTC'
c.strategy = 'trend_ema'
c.currency_capital = 100
c.overbought_rsi_periods = 14
c.buy_pct = 100
c.sell_pct = 100
c.period = '2h'
c.order_type = 'maker'
c.stats = true
c.mode = 'paper'