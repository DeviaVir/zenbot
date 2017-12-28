module.exports = {
  _ns: 'zenbot',

  'strategies.neural': require('./strategy'),
  'strategies.list[]': '#strategies.neural'
}
