module.exports = {
  _ns: 'zenbrain',
  'exchanges.gdax': require('./exchange.json'),
  'exchanges[]': '#exchanges.gdax',
  'mappers[]': [
    require('./backfiller'),
    require('./recorder')
  ]
}