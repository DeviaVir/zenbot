module.exports = {
  _ns: 'zenbot',
  'actions.backfill': require('./action'),
  'commands.backfill': require('./command.json'),
  'commands[]': '#commands.backfill'
}