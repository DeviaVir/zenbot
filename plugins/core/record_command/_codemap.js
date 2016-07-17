module.exports = {
  _ns: 'zenbot',
  'actions.record_trades': require('./record_trades'),
  'commands.record': require('./command'),
  'commands[]': '#commands.record'
}