module.exports = {
  _ns: 'zenbot',
  _folder: 'db',

  'createCollection': require('./createCollection'),
  'extensions': require('./extensions'),
  'selectors': require('./selectors'),
  'trades': require('./trades')
}