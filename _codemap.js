module.exports = {
  _ns: 'zenbot',
  _maps: [
    require('./commands/_codemap'),
    require('./db/_codemap'),
    require('./lib/_codemap'),
    require('./strategies/_codemap')
  ],
  'conf': null,
  'exchanges.list': []
}