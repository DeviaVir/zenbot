var c = module.exports = require('./config')

c.gdax_key = '' // TO ENABLE BOT TRADING: set this to GDAX api key,
c.gdax_secret = '' // set this to GDAX api secret,
c.gdax_passphrase = '' // set this to GDAX api passphrase.
c.trade_log = true // log new trades as they come in.

c.assets = [
  "ETH"
]
c.currencies = [
  "BTC"
]

// selector for indicators, trading, etc
c.default_selector = "gdax.ETH-BTC"
