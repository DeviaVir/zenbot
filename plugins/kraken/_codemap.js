module.exports = {
  _ns: 'zenbrain',
  'exchanges.kraken': require('./exchange.json'),
  'exchanges[]': '#exchanges.kraken',
  'mappers[]': [
    require('./backfiller'),
    require('./recorder')
  ]
}
