var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""

c.asset = "BTC"
c.currency = "USD"
c.currency_symbol = "$"
c.reducer_report_interval = 60000
c.enabled_plugins = [
  //'bitfinex',
  "gdax",
  "poloniex",
  "ticker_server"
]
c.exchanges = [
  "gdax",
  "poloniex"
]
c.sim_chunk_size = "7d"
c.sim_chunks_required = 12
c.max_slug_length = 17
c.default_graph_period = "15m"
c.default_graph_limit = 300
c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
c.rsi_exchange = "gdax"
c.rsi_periods = 14
c.backfill_stop = new Date().getTime() - 7776000000 // 90 days
c.record_timeout = 20000
c.backfill_timeout = 5000
