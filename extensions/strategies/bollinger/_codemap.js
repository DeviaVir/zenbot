module.exports = {
  _ns: 'zenbot',

  'strategies.bollinger': require('./strategy'),
  'strategies.list[]': '#strategies.bollinger'
}
