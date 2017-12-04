module.exports = {
  _ns: 'zenbot',

  'exchanges.binance': require('./exchange'),
  'exchanges.list[]': '#exchanges.binance'
}
