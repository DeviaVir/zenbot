var CoinbaseExchange = require('coinbase-exchange')
  , constants = require('../conf/constants')

module.exports = function container (get, set) {
  return new CoinbaseExchange.WebsocketClient(constants.product_id, constants.websocket_uri)
}