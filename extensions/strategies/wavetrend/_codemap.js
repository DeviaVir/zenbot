module.exports = {
  _ns: 'zenbot',

  'strategies.wavetrend': require('./strategy'),
  'strategies.list[]': '#strategies.wavetrend'
}
