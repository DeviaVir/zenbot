module.exports = {
  _ns: 'zenbot',

  'strategies.trend_ema': require('./strategy'),
  'strategies.list[]': '#strategies.trend_ema'
}