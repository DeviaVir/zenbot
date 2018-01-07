module.exports = {
  _ns: 'zenbot',

  'strategies.noop': require('./strategy'),
  'strategies.list[]': '#strategies.noop'
}
