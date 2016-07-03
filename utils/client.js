var CoinbaseExchange = require('coinbase-exchange')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  return new CoinbaseExchange.PublicClient(constants.product_id, constants.api_uri)
}