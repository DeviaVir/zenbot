var c = module.exports = require('./config_defaults')()

c.gdax_key = '' // TO ENABLE BOT TRADING: set this to GDAX api key,
c.gdax_secret = '' // set this to GDAX api secret,
c.gdax_passphrase = '' // set this to GDAX api passphrase.
c.trade_log = true // log new trades as they come in.

c.assets = [
  "BTC"
]
c.currencies = [
  "USD",
  "USDT",
  "BTC"
]

// default selector for indicators, etc
c.default_selector = "gdax.BTC-USD"
