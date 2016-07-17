module.exports = function container (get, set, clear) {
  return function make_exchange (exchange) {
    try {
      exchange.backfill_trades = get('exchanges.' + exchange.slug + '.backfill_trades')
    }
    catch (e) {}
    try {
      exchange.record_trades = get('exchanges.' + exchange.slug + '.record_trades')
    }
    catch (e) {}
    try {
      exchange.trader = get('exchanges.' + exchange.slug + '.trader')
    }
    catch (e) {}
    return exchange
  }
}