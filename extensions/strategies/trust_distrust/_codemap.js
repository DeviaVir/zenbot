module.exports = {
  _ns: 'zenbot',

  'strategies.trust_distrust': require('./strategy'),
  'strategies.list[]': '#strategies.trust_distrust'
}
