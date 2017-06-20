module.exports = {
  _ns: 'zenbot',

  'strategies.rsi': require('./strategy'),
  'strategies.list[]': '#strategies.rsi'
}