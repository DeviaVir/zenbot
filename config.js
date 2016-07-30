var config = module.exports = {}
config.asset = 'BTC'
config.currency = 'USD'
config.reducer_report_interval = 30000
config.enabled_plugins = [
  'bitfinex',
  'gdax'
]
config.sim_chunk_size = '90d'
config.max_slug_length = 22