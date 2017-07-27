module.exports = {
  _ns: 'zenbot',

  'strategies.forex_analytics': require('./strategy'),
  'strategies.list[]': '#strategies.forex_analytics'
}