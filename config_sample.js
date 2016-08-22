var c = module.exports = require('./config_defaults')()

// to run Zenbot 3,
// copy this file to config.js
// then ./run.sh

c.gdax_key = '' // TO ENABLE BOT TRADING: set this to GDAX api key,
c.gdax_secret = '' // set this to GDAX api secret,
c.gdax_passphrase = '' // set this to GDAX api passphrase.

// mongo stuff
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null

// twitter stuff (optional)
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""

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
  "USDT",
  "BTC"
]

// watch these exchanges
c.watch_exchanges = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex"
]

// default selector for indicators, etc
c.default_selector = "gdax.BTC-USD"

// add selectors in the format "{exchange-slug}.{asset}-{currency}" to graph them
c.graph_selectors = [
  c.default_selector
]

// trade logic
c.logic = require('./default_logic')
