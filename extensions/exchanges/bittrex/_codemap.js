module.exports = {
  _ns: 'zenbot',

  'exchanges.bittrex': require('./exchange'),
  'exchanges.list[]': '#exchanges.bittrex'
}