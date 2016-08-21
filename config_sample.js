var c = module.exports = require('./config_defaults')()

// to enable,
// copy this file to config.js
// and edit

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
// add plugins you want to enable
c.enabled_plugins = [
  //"bitfinex",
  "gdax",
  //"kraken",
  //"poloniex",
  "server"
]

// default selector for indicators, etc
c.default_selector = "gdax.BTC-USD"

// trade logic
c.logic = require('./default_logic')
