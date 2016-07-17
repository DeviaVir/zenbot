module.exports = {
  _ns: 'zenbot',
  'actions.status': require('./status'),
  'commands.status': require('./command'),
  'commands[]': '#commands.status'
}