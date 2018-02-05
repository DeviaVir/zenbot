module.exports = {
  _ns: 'zenbot',

  'strategies.ta_trix': require('./strategy'),
  'strategies.list[]': '#strategies.ta_trix'
}
