module.exports = {
  _ns: 'zenbot',
  'actions.learn_params': require('./learn_params'),
  'commands.learn': require('./command'),
  'commands[]': '#commands.learn'
}