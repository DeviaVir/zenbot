var CoinbaseExchange = require('coinbase-exchange')

module.exports = function container (get, set) {
  return new CoinbaseExchange.PublicClient()
}