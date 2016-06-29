var CoinbaseExchange = require('coinbase-exchange')

module.exports = function container (get, set) {
  return new CoinbaseExchange.PublicClient(get('conf.product_id'), get('conf.gdax').apiURI)
}