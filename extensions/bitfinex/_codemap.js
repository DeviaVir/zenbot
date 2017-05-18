module.exports = {
  _ns: 'zenbot',
  _name: 'bitfinex',

  'exchanges.bitfinex': require('./exchange'),
  'exchanges.list[]': '#exchanges.bitfinex'
}