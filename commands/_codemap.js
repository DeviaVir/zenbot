module.exports = {
  _ns: 'zenbot',
  _folder: 'commands',

  'list[0]': '#commands.init',
  'list[10]': '#commands.extend',
  'list[20]': '#commands.watch',
  'list[30]': '#commands.watcher',

  'init': require('./init'),
  'extend': require('./extend'),
  'watch': require('./watch'),
  'watcher': require('./watcher')
}