module.exports = {
  _ns: 'zenbot',
  _folder: 'db',

  'createCollection': require('./createCollection'),
  'extensions': require('./extensions'),
  'resume_markers': require('./resume_markers'),
  'selectors': require('./selectors'),
  'trades': require('./trades')
}