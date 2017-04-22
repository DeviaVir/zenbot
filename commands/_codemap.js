module.exports = {
  _ns: 'zenbot',
  _folder: 'commands',

  'list[0]': '#commands.init',
  'list[10]': '#commands.extend',
  'list[20]': '#commands.list-selectors',
  'list[30]': '#commands.watch',
  'list[40]': '#commands.watcher',
  'list[50]': '#commands.backfill',

  'init': require('./init'),
  'extend': require('./extend'),
  'list-selectors': require('./list-selectors'),
  'ls': '#commands.list-selectors',
  'watch': require('./watch'),
  'watcher': require('./watcher'),
  'backfill': require('./backfill')
}