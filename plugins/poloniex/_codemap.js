module.exports = {
  _ns: 'zenbrain',
  'exchanges.poloniex': require('./exchange.json'),
  'exchanges[]': '#exchanges.poloniex',
  'mappers[]': [
    require('./backfiller'),
    require('./recorder')
  ]
}