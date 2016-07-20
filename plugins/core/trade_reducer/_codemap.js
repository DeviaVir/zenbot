module.exports = {
  _ns: 'zenbot',
  'create_tick': require('./create_tick'),
  'reducers.trade': require('./reduce_trades'),
  'reducers[]': '#reducers.trade'
}