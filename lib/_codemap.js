module.exports = {
  _ns: 'zenbot',
  _folder: 'lib',
  _maps: [
    require('./talib/_codemap')
  ],

  'engine': require('./engine'),
  'normalize-selector': require('./normalize-selector'),
  'rsi': require('./rsi'),
  'ema': require('./ema'),
  'sma': require('./sma'),
  'stddev': require('./stddev')
}
