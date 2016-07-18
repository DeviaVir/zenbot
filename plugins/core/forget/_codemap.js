module.exports = {
  _ns: 'zenbot',
  'actions.forget': require('./forget'),
  'commands.forget': require('./command.json'),
  'commands[]': '#commands.forget'
}