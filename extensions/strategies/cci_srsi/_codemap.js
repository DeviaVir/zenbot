module.exports = {
  _ns: 'zenbot',

  'strategies.cci_srsi': require('./strategy'),
  'strategies.list[]': '#strategies.cci_srsi'
}
