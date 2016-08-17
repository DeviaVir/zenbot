var c = module.exports = {}

c.gdax_key = '' // TO ENABLE BOT TRADING: set this to GDAX api key,
c.gdax_secret = '' // set this to GDAX api secret,
c.gdax_passphrase = '' // set this to GDAX api passphrase.

// mongo stuff
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null

// add assets/currencies you want to track
c.assets = [
  "BTC",
  //"ETH",
  //"LTC",
]
c.currencies = [
  //"CNY",
  //"EUR",
  "USD",
  "USDT"
]
// will require(plugins/{name}/_codemap or {name}/_codemap)
// to watch an exchange, uncomment it from the list below.
c.enabled_plugins = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex",
  "server"
]

// twitter stuff
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""

// graph server
c.default_graph_period = "1h"
c.default_graph_limit = 500
c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
// add selectors in the format "{exchange-slug}.{asset}-{currency}" to graph them
c.graph_selectors = [
  "gdax.BTC-USD",
  //"kraken.BTC-USD",
  //"poloniex.BTC-USDT",
  //"bitfinex.BTC-USD",
]
c.log_query_limit = 200
c.tracking_scripts = ''

// RSI indicator config
c.rsi_sizes = ['1h']
c.rsi_reporter_selector = "gdax.BTC-USD"
c.rsi_query_limit = 100
c.rsi_periods = 14

// trade logic
c.logic = require('./default_logic')

// reporter
c.reporter_sizes = ['5m']
c.price_reporter_selector = "gdax.BTC-USD"
c.price_reporter_length = 9
c.reporter_cols = [
  "tick_id",
  "num_trades",
  "timestamp",
  "rsi",
  "volume",
  "price",
  "progress"
]
c.reducer_report_interval = 30000
c.trade_report_interval = 30000
c.min_log_trades = 2

// backfiller
c.backfill_days = 91
c.record_timeout = 20000
c.backfill_timeout = 5000

// simulator
c.sim_input_unit = "7d"
c.sim_input_limit = 12

// zenbrain engine stuff
c.bucket_size = "1m"
c.reducer_limit = 500 // how many thoughts to process per reduce run
c.reducer_sizes = ["1m", "5m", "15m", "1h", "6h", "1d"]
c.save_state_interval = 10000 // save state
c.parallel_limit = 8 // run this many concurrent tasks
c.reduce_timeout = 200
c.run_limit = 100
c.lock_timeout = 60000
c.lock_backoff = 20
c.lock_tries = 100
c.passive_update_timeout = 5000
c.return_timeout = 60000
c.brain_speed_ms = 200
