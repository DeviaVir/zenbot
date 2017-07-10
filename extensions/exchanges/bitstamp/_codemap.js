module.exports = {
  _ns: 'zenbot',
  _name: 'bitstamp',

  'exchanges.bitstamp': require('./exchange'),
  'exchanges.list[]': '#exchanges.bitstamp'
}
