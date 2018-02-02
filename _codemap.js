module.exports = {
  _ns: 'zenbot',
  _maps: [
    require('./commands/_codemap'),
    require('./commands/backfill/_codemap'),
    require('./db/_codemap'),
    require('./lib/_codemap')
  ],
  'conf': {},
  'exchanges.list': [],
  'strategies.list': []
}