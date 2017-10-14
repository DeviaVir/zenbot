var c = module.exports = {}

c.selector = 'poloniex.ARDR-BTC'
c.strategy = 'forex_analytics'
c.modelfile = 'config/models/ardr_btc.json'
c.currency_capital = 0.1
c.buy_pct = 100
c.sell_pct = 100
c.period = '4h'
c.order_type = 'maker'
c.stats = true