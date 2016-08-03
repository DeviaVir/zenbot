module.exports = {
  _ns: 'zenbrain',
  'thought_reducers[]': require('./trade_reducer'),
  'reporters[]': require('./reporter'),
  'thinkers[]': require('./thinker'),
  'tick_reducers[]': require('./tick_reducer'),
  trade_reducer: require('./trade_reducer')
}