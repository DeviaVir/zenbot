module.exports = {
  _ns: 'zenbot',
  _folder: 'commands',

  'list-selectors': require('./list-selectors'),
  'list-strategies': require('./list-strategies'),
  'backfill': require('./backfill'),
  'sim': require('./sim'),
  'train': require('./train'),
  'balance': require('./balance'),
  'trade': require('./trade'),
  'buy': require('./buy'),
  'sell': require('./sell'),

  'list[20]': '#commands.list-selectors',
  'list[30]': '#commands.list-strategies',
  'list[50]': '#commands.backfill',
  'list[60]': '#commands.sim',
  'list[62]': '#commands.train',
  'list[65]': '#commands.balance',
  'list[70]': '#commands.trade',
  'list[80]': '#commands.buy',
  'list[90]': '#commands.sell'
}
