module.exports = {
  _ns: 'zenbot',

  'strategies.speed': require('./strategy'),
  'strategies.list[]': '#strategies.speed'
}