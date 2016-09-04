module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./actions/_codemap'),
    require('./commands/_codemap'),
    require('./indicators/_codemap')
  ],
  'action_handlers[]': require('./action_handler'),
  'reporters[]': require('./reporter'),
  exchange_defaults: require('./exchange_defaults'),
  'tick_reducers[]': require('./tick_reducer'),
  'thought_reducers[]': require('./trade_reducer'),
  reporter_cols: []
}