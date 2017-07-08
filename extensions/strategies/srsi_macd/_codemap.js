module.exports = {
  _ns: 'zenbot',

  'strategies.srsi_macd': require('./strategy'),
  'strategies.list[]': '#strategies.srsi_macd'
}
