var c = module.exports = require('./config')

c.assets = [
  "BTC" // for GDAX
  //"XXBT" // for kraken
]
c.currencies = [
  // for GDAX
  "USD",
  "USDT",
  "BTC",
  // for kraken
  /*
  "ZUSD",
  "XXBT"
  */
]

// default selector for indicators, trading, etc
c.default_selector = "gdax.BTC-USD"
//c.default_selector = "kraken.XXBT-ZUSD"
