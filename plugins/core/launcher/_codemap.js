module.exports = {
  _ns: 'zenbot',
  'launcher': require('./launcher'),
  'launcher.save_state': require('./save_state'),
  'motley:hooks.close[-1]': '#zenbot:launcher.save_state',
  'commands.launch': require('./command.json'),
  'commands[]': '#commands.launch',
  'actions.launch': require('./launch')
}