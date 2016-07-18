module.exports = {
  _ns: 'zenbot',
  'actions.reduce_trades': require('./action'),
  'reducers.trade': require('./reducer.json'),
  'reducers[]': '#reducers.trade'
}