module.exports = {
  _ns: 'zenbot',

  'strategies.ta_ema': require('./strategy'),
  'strategies.list[]': '#strategies.ta_ema'
}
