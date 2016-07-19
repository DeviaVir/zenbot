module.exports = {
  _ns: 'zenbot',
  'actions.record_trades': require('./record_trades'),
  'recorders.trade': require('./recorder.json'),
  'recorders[]': '#recorders.trade'
}