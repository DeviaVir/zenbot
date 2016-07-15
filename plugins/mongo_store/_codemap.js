module.exports = {
  _ns: 'zenbot',
  _maps: [
    require('motley-mongo'),
    require('./conf/_codemap'),
    require('./db/_codemap'),
    require('./hooks/_codemap')
  ]
}