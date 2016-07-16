module.exports = {
  _ns: 'zenbot',
  'forgetter': require('./default_forgetter'),
  'commands.forget': require('./forget_command'),
  'commands[]': '#commands.forget'
}