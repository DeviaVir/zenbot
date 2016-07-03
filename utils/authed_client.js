var CoinbaseExchange = require('coinbase-exchange')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var config = require('../config.js')
  return new CoinbaseExchange.AuthenticatedClient(config.gdax_key, config.gdax_secret, config.gdax_passphrase, constants.api_uri)
}