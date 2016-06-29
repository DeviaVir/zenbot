var CoinbaseExchange = require('coinbase-exchange')

module.exports = function container (get, set, clear) {
  var conf = get('conf.gdax')
  var authedClient = new CoinbaseExchange.AuthenticatedClient(conf.key, conf.secret, conf.passphrase, conf.apiURI)
  return authedClient
}