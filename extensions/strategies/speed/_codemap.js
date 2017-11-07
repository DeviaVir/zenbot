module.exports = {
  _ns: 'zenbot',

  'strategies.stddev': require('./strategy'),
  'strategies.list[]': '#strategies.stddev'
}
