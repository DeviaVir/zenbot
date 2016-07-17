module.exports = {
  _ns: 'zenbot',
  'actions.reduce': require('./action'),
  'commands.reduce': require('./command.json'),
  'commands[]': '#commands.reduce'
}