module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./indicators/_codemap')
  ],
  'thought_reducers[]': require('./trade_reducer'),
  'reporters[]': require('./reporter'),
  'thinkers[]': require('./thinker'),
  'tick_reducers[]': require('./tick_reducer'),
  trade_reducer: require('./trade_reducer')
}