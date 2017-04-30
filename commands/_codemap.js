module.exports = {
  _ns: 'zenbot',
  _folder: 'commands',

  'list[10]': '#commands.extend',
  'list[20]': '#commands.list-selectors',
  'list[50]': '#commands.backfill',
  'list[60]': '#commands.sim',

  'extend': require('./extend'),
  'list-selectors': require('./list-selectors'),
  'ls': '#commands.list-selectors',
  'backfill': require('./backfill'),
  'sim': require('./sim')
}