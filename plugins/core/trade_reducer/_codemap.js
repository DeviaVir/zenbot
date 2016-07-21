module.exports = {
  _ns: 'zenbot',
  'create_tick': require('./create_tick'),
  'process_trades': require('./process_trades'),
  'reducers.trade': require('./reduce_trades'),
  'reducers[]': '#reducers.trade'
}