module.exports = {
  _ns: 'zenbot',

  'strategies.trend_bollinger': require('./strategy'),
  'strategies.list[]': '#strategies.trend_bollinger'
}
