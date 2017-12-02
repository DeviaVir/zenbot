module.exports = {
  _ns: 'zenbot',

  'exchanges.wexnz': require('./exchange'),
  'exchanges.list[]': '#exchanges.wexnz'
}
