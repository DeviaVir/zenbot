var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""
c.assets = [
  "BTC",
  "ETH",
  "LTC"
]
c.currencies = [
  "CNY",
  "EUR",
  "USD"
]
c.reducer_report_interval = 60000
c.enabled_plugins = [
  "bitfinex",
  "gdax",
  "poloniex",
  "server"
]
c.default_graph_period = "15m"
c.default_graph_limit = 300
c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
c.graph_selectors = [
  "gdax.BTC-USD",
  "gdax.BTC-EUR",
  "gdax.ETH-USD",
  "poloniex.BTC-USD",
  "bitfinex.BTC-USD",
  "bitfinex.ETH-USD",
  "bitfinex.ETH-BTC",
  "bitfinex.ETC-BTC",
  "bitfinex.LTC-USD",
  "bitfinex.LTC-BTC",
  "bitfinex.ETC-BTC",
  "bitfinex.ETC-USD"
]
c.rsi_query_limit = 100
c.rsi_periods = 14
c.rsi_reporter_selector = "gdax.BTC-USD"
c.price_reporter_selector = "gdax.BTC-USD"
c.price_reporter_length = 8
c.reporter_cols = [
  "tick_id",
  "timestamp",
  "num_trades",
  "volume",
  "price",
  "rsi"
]
c.backfill_days = 90
c.record_timeout = 20000
c.backfill_timeout = 10000
c.trade_report_interval = 20000
