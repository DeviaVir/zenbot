module.exports = function container (get, set, clear) {
  var exchange = require('./exchange.json')
  exchange.backfiller = get('exchanges.gdax.backfiller')
  exchange.recorder = get('exchanges.gdax.recorder')
  exchange.trader = get('exchanges.gdax.trader')
  return exchange
}