module.exports = {
  _ns: 'zenbot',
  'actions.record': require('./record'),
  'commands.record': require('./command.json'),
  'commands[]': '#commands.record'
}