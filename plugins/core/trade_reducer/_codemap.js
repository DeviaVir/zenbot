module.exports = {
  _ns: 'zenbot',
  'actions.reduce_trades': require('./reduce_trades'),
  'reducers.trade': require('./reducer.json'),
  'reducers[]': '#reducers.trade'
}