module.exports = {
  _ns: 'zenbot',

  'strategies.macd': require('./strategy'),
  'strategies.list[]': '#strategies.macd'
}