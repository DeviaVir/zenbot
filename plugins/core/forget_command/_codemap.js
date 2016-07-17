module.exports = {
  _ns: 'zenbot',
  'actions.forget': require('./forget'),
  'commands.forget': require('./command'),
  'commands[]': '#commands.forget'
}