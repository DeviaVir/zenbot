module.exports = {
  _ns: 'zenbot',
  'actions.run': require('./run'),
  'commands.run': require('./command'),
  'commands[]': '#commands.run'
}