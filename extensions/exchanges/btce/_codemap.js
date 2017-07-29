module.exports = {
  _ns: 'zenbot',

  'exchanges.btce': require('./exchange'),
  'exchanges.list[]': '#exchanges.btce'
}
