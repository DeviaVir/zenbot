module.exports = {
  _ns: 'zenbot',

  'exchanges.gdax': require('./exchange'),
  'exchanges.list[]': '#exchanges.gdax'
}