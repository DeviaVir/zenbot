module.exports = {
  _ns: 'zenbot',

  'exchanges.cexio': require('./exchange'),
  'exchanges.list[]': '#exchanges.cexio'
}
