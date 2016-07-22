module.exports = {
  _ns: 'zenbot',
  brain: require('./brain'),
  'sensors[]': require('./sensor'),
  'thinkers[]': require('./thinker')
}