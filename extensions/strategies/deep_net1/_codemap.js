module.exports = {
  _ns: 'zenbot',

  'strategies.deep_net1': require('./strategy'),
  'strategies.list[]': '#strategies.deep_net1'
}
