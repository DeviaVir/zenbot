var c = module.exports = {}

c.selector = 'gdax.BTC-EUR'
c.strategy = 'forex_analytics'
c.modelfile = 'config/models/btc_eur.json'
c.currency_capital = 100
c.buy_pct = 100
c.sell_pct = 100
c.period = '2h'
c.order_type = 'maker'
c.stats = true
c.mode = 'paper'