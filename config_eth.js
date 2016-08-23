var c = module.exports = require('./config')

// an example config
// watches/trades ETH/USD and ETH/BTC
// use this config by running:
// ./zenbot launch map --backfill run --config config_eth.js --rs eth
// (assumes reduce and server commands are running in a separate process)

c.trade_log = true

c.assets = [
  "ETH"
]
c.currencies = [
  "USD",
  "BTC"
]

// watch these exchanges
c.watch_exchanges = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.ETH-USD"
