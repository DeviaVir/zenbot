module.exports = {
  _ns: 'zenbot',
  _folder: 'db',

  'createCollection': require('./createCollection'),
  'resume_markers': require('./resume_markers'),
  'trades': require('./trades')
}