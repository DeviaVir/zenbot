var c = module.exports = require('./config')

c.assets = [
  "ETH"
]
c.currencies = [
  "USD",
  "USDT",
  "ETH"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.ETH-USD"
