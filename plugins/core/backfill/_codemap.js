module.exports = {
  _ns: 'zenbot',
  'actions.backfill': require('./backfill'),
  'commands.backfill': require('./command.json'),
  'commands[]': '#commands.backfill'
}