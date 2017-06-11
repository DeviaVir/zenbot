module.exports = {
  _ns: 'zenbot',

  'strategies.sar': require('./strategy'),
  'strategies.list[]': '#strategies.sar'
}