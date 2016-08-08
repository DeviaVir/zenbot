module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./indicators/_codemap')
  ],
  'reporters[]': require('./reporter'),
  tick_defaults: require('./tick_defaults'),
  'tick_reducers[]': require('./tick_reducer'),
  'thought_reducers[]': require('./trade_reducer'),
  reporter_cols: []
}