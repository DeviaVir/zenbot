module.exports = {
  _ns: 'zenbot',

  'exchanges.hitbtc': require('./exchange'),
  'exchanges.list[]': '#exchanges.hitbtc'
}
