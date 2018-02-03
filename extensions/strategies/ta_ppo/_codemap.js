module.exports = {
  _ns: 'zenbot',

  'strategies.ta_ppo': require('./strategy'),
  'strategies.list[]': '#strategies.ta_ppo'
}
