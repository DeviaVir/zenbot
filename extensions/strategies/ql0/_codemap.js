module.exports = {
  _ns: 'zenbot',

  'strategies.ql0': require('./strategy'),
  'strategies.list[]': '#strategies.ql0'
}
