module.exports = {
  _ns: 'zenbot',
  _folder: 'db',

  'balances': require('./balances'),
  'createCollection': require('./createCollection'),
  'resume_markers': require('./resume_markers'),
  'sessions': require('./sessions'),
  'trades': require('./trades')
}