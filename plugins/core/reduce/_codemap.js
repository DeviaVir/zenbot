module.exports = {
  _ns: 'zenbot',
  'actions.reduce': require('./reduce'),
  'commands.reduce': require('./command.json'),
  'commands[]': '#commands.reduce'
}