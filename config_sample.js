var c = module.exports = require('./config_defaults')()

// mongo stuff
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null

// watch these exchanges
c.watch_exchanges = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.BTC-USD"

// add selectors in the format "{exchange-slug}.{asset}-{currency}" to graph them
c.graph_selectors = [
  c.default_selector,
  "gdax.ETH-BTC",
  "gdax.ETH-USD"
]

// trade logic
c.logic = require('./default_logic')
