module.exports = {
  _ns: 'zenbot',
  'backfiller': require('./default_backfiller'),
  'commands.backfill': require('./backfill_command'),
  'commands[]': [
    '#commands.backfill'
  ]
}