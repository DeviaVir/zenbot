module.exports = {
  _ns: 'zenbot',
  'actions.export': require('./export'),
  'commands.export': require('./command.json'),
  'commands[]': '#commands.export'
}