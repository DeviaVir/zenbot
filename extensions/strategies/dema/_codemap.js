module.exports = {
  _ns: 'zenbot',

  'strategies.dema': require('./strategy'),
  'strategies.list[]': '#strategies.dema'
}
