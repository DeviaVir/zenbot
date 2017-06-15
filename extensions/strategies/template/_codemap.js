module.exports = {
  _ns: 'zenbot',

  'strategies.honey_badger': require('./strategy'),
  'strategies.list[]': '#strategies.honey_badger'
}
