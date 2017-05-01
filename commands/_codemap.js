module.exports = {
  _ns: 'zenbot',
  _folder: 'commands',

  'list-selectors': require('./list-selectors'),
  'backfill': require('./backfill'),
  'sim': require('./sim'),

  'list[20]': '#commands.list-selectors',
  'list[50]': '#commands.backfill',
  'list[60]': '#commands.sim'
}