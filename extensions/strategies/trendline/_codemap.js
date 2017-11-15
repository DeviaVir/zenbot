module.exports = {
  _ns: 'zenbot',

  'strategies.trendline': require('./strategy'),
  'strategies.list[]': '#strategies.trendline'
}
