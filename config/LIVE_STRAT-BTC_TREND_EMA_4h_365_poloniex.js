var c = module.exports = {}

c.selector = 'poloniex.STRAT-BTC'
c.strategy = 'trend_ema'
c.currency_capital = 100
c.overbought_rsi_periods = 14
c.buy_pct = 33
c.sell_pct = 100
c.period = '4h'
c.order_type = 'maker'
c.stats = true
// c.mode = 'paper'