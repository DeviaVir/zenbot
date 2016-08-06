var config = module.exports = {}
config.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
config.mongo_username = null // normally not needed
config.mongo_password = null
config.twitter_key = "" // create a twitter app, generate an access token, and add it here
config.twitter_secret = ""
config.twitter_access_token = ""
config.twitter_access_token_secret = ""

config.asset = "BTC"
config.currency = "USD"
config.currency_symbol = "$"
config.reducer_report_interval = 60000
config.enabled_plugins = [
  //'bitfinex',
  'gdax',
  'poloniex',
  'ticker_server'
]
config.exchanges = [
  'gdax',
  'poloniex'
]
config.sim_chunk_size = "7d"
config.sim_chunks_required = 12
config.max_slug_length = 17
config.default_graph_period = '5m'
config.default_graph_limit = 150
config.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
config.rsi_periods = 14
config.rsi_report_period = '5m'
