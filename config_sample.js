var c = module.exports = require('./config_defaults')()

// mongo stuff
c.mongo_url = "mongodb://" + (process.env.MONGODB_PORT_27017_TCP_ADDR || "localhost") + ":27017/zenbrain" // change if your mongo server isn't local

c.mongo_username = null // normally not needed
c.mongo_password = null

c.trade_log = true // log new trades as they come in.
//c.trade_reducer_log = true

// watch these exchanges
c.watch_exchanges = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.BTC-USD"
//c.default_selector = "kraken.XXBT-ZUSD"

// add selectors in the format "{exchange-slug}.{asset}-{currency}" to graph them
c.graph_selectors = [
  c.default_selector,
  "gdax.ETH-BTC",
  "gdax.ETH-USD"
]

// For REAL live trading:
require("./credentials.js");

// Include a trade logic, copy and change logic.gdax.js as
// needed to make it fit your exchange and needs
exchange = c.default_selector.split(".",1);
c.logic = require('./logic.'+exchange)
