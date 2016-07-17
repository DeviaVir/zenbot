module.exports = {
  _ns: 'zenbot',
  'actions.backfill_trades': require('./backfill_trades'),
  'commands.backfill': require('./command'),
  'commands[]': '#commands.backfill'
}