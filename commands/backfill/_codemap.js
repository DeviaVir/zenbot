module.exports = {
  _ns: 'zenbot',
  _folder: 'commands.backfill',

  'backfillFunction': require('./backfill.function'),
  'backfillConsumeFunction': require('./backfill.consume.function'),
  'backfillProcessFunction': require('./backfill.process.function'),
  'backfillUpdateScreenFunction': require('./backfill.update-screen.function')
}
