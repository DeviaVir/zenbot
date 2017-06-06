module.exports = {
  _ns: 'zenbot',

  'exchanges.kraken': require('./exchange'),
  'exchanges.list[]': '#exchanges.kraken'
}