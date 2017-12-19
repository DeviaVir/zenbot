module.exports = {
  _ns: 'zenbot',

  'strategies.cryptofeest': require('./strategy'),
  'strategies.list[]': '#strategies.cryptofeest'
}
