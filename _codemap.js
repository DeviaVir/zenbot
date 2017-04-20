module.exports = {
  _ns: 'zenbot',
  _maps: [
    require('./db/_codemap')
  ],
  'exchanges[]': [],
  'mongodb': require('mongodb'),
  'sosa_mongo': require('sosa_mongo')
}