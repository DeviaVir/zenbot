module.exports = {
  _ns: 'zenbot',
  'actions.learn': require('./learn'),
  'commands.learn': require('./command.json'),
  'commands[]': '#commands.learn'
}