var config = module.exports = {}
config.enabled_plugins = [] // set to something like ['extras/twitter']
config.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
config.mongo_username = null // normally not needed
config.mongo_password = null
config.twitter_key = "" // create a twitter app, generate an access token, and add it here
config.twitter_secret = ""
config.twitter_access_token = ""
config.twitter_access_token_secret = ""
config.id_bytes = 8 // for random IDs
config.brain_speed = "10s"
config.brain_speed_ms = 10000 // same in ms
config.reducer_limit = 1000 // how many thoughts to process per reduce run
config.save_state_interval = 10000 // save state
config.parallel_limit = 8 // run this many concurrent tasks
config.reduce_timeout = 1000

config.asset = 'BTC'
config.currency = 'USD'
config.reducer_report_interval = 30000
config.enabled_plugins = [
  //'bitfinex',
  'gdax'
]
config.sim_chunk_size = '7d'
config.sim_chunks_required = 12
config.max_slug_length = 17
config.backfill_status_check = '30s'
config.backfill_status_timeout = 35000
