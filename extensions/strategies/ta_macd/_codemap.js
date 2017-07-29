module.exports = {
  _ns: 'zenbot',

  'strategies.ta_macd': require('./strategy'),
  'strategies.list[]': '#strategies.ta_macd'
}
