module.exports = {
  _ns: 'zenbot',

  'exchanges.poloniex': require('./exchange'),
  'exchanges.list[]': '#exchanges.poloniex'
}