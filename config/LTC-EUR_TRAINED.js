var c = module.exports = {}

c.selector = 'gdax.LTC-EUR'
c.strategy = 'forex_analytics'
c.modelfile = 'config/models/ltc_eur.json'
c.currency_capital = 0.1
c.buy_pct = 100
c.sell_pct = 100
c.period = '1h'
c.order_type = 'maker'
c.stats = true
c.mode = 'paper'