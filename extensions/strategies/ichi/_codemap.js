module.exports = {
  _ns: 'zenbot',

  'strategies.ichi': require('./strategy'),
  'strategies.list[]': '#strategies.ichi'
}
