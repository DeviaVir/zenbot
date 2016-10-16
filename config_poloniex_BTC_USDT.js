var c = module.exports = require('./config')

c.assets = [
  "BTC"
]
c.currencies = [
  "USDT"
]

// selector for indicators, trading, etc
c.default_selector = "poloniex.BTC-USDT"

c.logic = require('./poloniex_logic')
c.poloniex_slippage = 0.025