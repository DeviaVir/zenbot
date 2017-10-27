var c = module.exports = {}

c.selector = 'gdax.ETH-EUR'
c.strategy = 'trend_ema'
c.currency_capital = 200
c.overbought_rsi_periods = 14
c.buy_pct = 100
c.sell_pct = 100
c.period = '30m'
c.order_type = 'maker'
c.stats = true
// c.mode = 'paper'