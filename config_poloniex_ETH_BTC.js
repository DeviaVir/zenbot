var c = module.exports = require('./config')

c.assets = [
  "ETH"
]
c.currencies = [
  "BTC",
]

// selector for indicators, trading, etc
c.default_selector = "poloniex.ETH-BTC"

c.logic = require('./poloniex_logic')
c.poloniex_slippage = 0.025