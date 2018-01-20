module.exports = {
  _ns: 'zenbot',

  'strategies.momentum': require('./strategy'),
  'strategies.list[]': '#strategies.momentum'
}
