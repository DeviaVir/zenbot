module.exports = {
  _ns: 'zenbrain',
  'exchanges.bitfinex': require('./exchange.json'),
  'exchanges[]': '#exchanges.bitfinex',
  'mappers[]': [
    require('./recorder')
  ]
}