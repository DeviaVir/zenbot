module.exports = {
  _ns: 'zenbot',

  'strategies.ta_macd_ext': require('./strategy'),
  'strategies.list[]': '#strategies.ta_macd_ext'
}
