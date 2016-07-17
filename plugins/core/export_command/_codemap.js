module.exports = {
  _ns: 'zenbot',
  'actions.export_ticks': require('./export_ticks'),
  'commands.export': require('./command'),
  'commands[]': '#commands.export'
}