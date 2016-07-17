module.exports = {
  _ns: 'zenbot',
  'actions.mapreduce': require('./mapreduce'),
  'commands.mapreduce': require('./command'),
  'commands[]': '#commands.mapreduce'
}