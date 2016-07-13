module.exports = {
  _ns: 'motley',
  _maps: [
    require('./bot/_codemap'),
    require('./db/_codemap'),
    require('./controllers/_codemap'),
    require('./exchanges/_codemap'),
    require('./hooks/_codemap'),
    require('./middleware/_codemap'),
    require('./utils/_codemap')
  ]
}