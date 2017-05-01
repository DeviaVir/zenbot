module.exports = {
  _ns: 'zenbot',
  _name: 'trend_ema_rate',

  'strategies.trend_ema_rate': require('./strategy'),
  'strategies.list[]': '#strategies.trend_ema_rate'
}