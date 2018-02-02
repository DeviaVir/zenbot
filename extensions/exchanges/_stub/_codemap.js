module.exports = {
  _ns: 'zenbot',

  'exchanges.stub': require('./exchange'),
  'exchanges.list[]': '#exchanges.stub'
}
