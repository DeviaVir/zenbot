module.exports = {
  _ns: 'motley',
  _maps: [
    require('./conf/_codemap'),
    require('./controllers/_codemap'),
    require('./db/_codemap'),
    require('./hooks/_codemap'),
    require('./middleware/_codemap'),
    require('./vendor/_codemap')
  ]
}