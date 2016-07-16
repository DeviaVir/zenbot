module.exports = {
  _ns: 'zenbot',
  'launcher': require('./default_launcher'),
  'motley:hooks.close[-1]': require('./save_state')
}