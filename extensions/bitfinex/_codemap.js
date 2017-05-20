module.exports = {
  _ns: 'zenbot',

  'exchanges.bitfinex': require('./exchange'),
  'exchanges.list[]': '#exchanges.bitfinex'
}
