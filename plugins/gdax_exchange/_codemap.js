module.exports = {
  _ns: 'zenbot',

  'backfillers.gdax': require('./backfiller'),
  'backfillers[]': '#backfillers.gdax',

  'exchanges.gdax': require('./exchange.json'),
  'exchanges[]': '#exchanges.gdax',

  'recorders.gdax': require('./recorder'),
  'recorders[]': '#recorders.gdax',

  'traders.gdax': require('./trader'),
  'traders[]': '#traders.gdax'
}