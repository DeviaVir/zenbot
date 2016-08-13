module.exports = {
  _ns: 'zenbrain',
  'mappers[]': require('./backfiller'),
  'reporter_cols.rsi': require('./reporter_col'),
  'tick_reducers[10]': require('./tick_reducer'),
  '@commands.map': function container (get, set, clear) {
    return function alter (command) {
      command.options || (command.options = [])
      command.options.push({
        name: 'backfill_rsi',
        description: 'backfill RSI indicator (expensive)'
      })
      return command
    }
  },
  '@commands.reduce': function container (get, set, clear) {
    return function alter (command) {
      command.options || (command.options = [])
      command.options.push({
        name: 'backfill_rsi',
        description: 'backfill RSI indicator (expensive)'
      })
      return command
    }
  }
}