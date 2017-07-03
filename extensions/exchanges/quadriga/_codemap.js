module.exports = {
  _ns: 'zenbot',
  _name: 'quadriga',

  'exchanges.quadriga': require('./exchange'),
  'exchanges.list[]': '#exchanges.quadriga'
}
