module.exports = {
  _ns: 'zenbot',

  'strategies.rsi_macd': require('./strategy'),
  'strategies.list[]': '#strategies.rsi_macd'
}