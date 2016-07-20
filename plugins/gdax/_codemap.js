module.exports = {
  _ns: 'zenbot',
  'exchanges.gdax': require('./exchange.json'),
  'exchanges[]': '#exchanges.gdax',
  'backfillers[]': require('./backfiller'),
  'recorders[]': require('./recorder')
}