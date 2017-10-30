module.exports = {
  _ns: 'zenbot',

  'exchanges.therock': require('./exchange'),
  'exchanges.list[]': '#exchanges.therock'
}
