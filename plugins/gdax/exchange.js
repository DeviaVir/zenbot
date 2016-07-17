module.exports = function container (get, set, clear) {
  var exchange = require('./exchange.json')
  var make_exchange = get('utils.make_exchange')
  return make_exchange(exchange)
}