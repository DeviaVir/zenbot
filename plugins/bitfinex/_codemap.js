module.exports = {
  _ns: 'zenbot',
  'exchanges.bitfinex': require('./exchange.json'),
  'exchanges[]': '#exchanges.bitfinex',
  'backfillers[]': require('./backfiller'),
  'recorders[]': require('./recorder')
}