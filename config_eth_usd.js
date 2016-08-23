var c = module.exports = require('./config')

// use this config by running:
// ./zenbot launch map --backfill run --config config_eth_usd.js --rs eth_usd

// an example config
// watches/trades ETH/USD
// (assumes reduce and server commands are running in a separate process)

c.gdax_key = '' // TO ENABLE BOT TRADING: set this to GDAX api key,
c.gdax_secret = '' // set this to GDAX api secret,
c.gdax_passphrase = '' // set this to GDAX api passphrase.
c.trade_log = true // log new trades as they come in.

c.assets = [
  "ETH"
]
c.currencies = [
  "USD"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.ETH-USD"
