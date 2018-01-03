module.exports = {
  _ns: 'zenbot',

  'strategies.dema-lessnoise': require('./strategy'),
  'strategies.list[]': '#strategies.dema-lessnoise'
}
