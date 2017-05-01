module.exports = {
  _ns: 'zenbot',
  _name: 'gdax',

  'exchanges.gdax': require('./exchange'),
  'exchanges.list[]': '#exchanges.gdax'
}