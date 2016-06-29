var CoinbaseExchange = require('coinbase-exchange')

module.exports = function container (get, set) {
  return new CoinbaseExchange.WebsocketClient(get('conf.product_id'), get('conf.gdax').websocketURI)
}