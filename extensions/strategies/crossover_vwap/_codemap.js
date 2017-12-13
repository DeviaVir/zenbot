module.exports = {
  _ns: 'zenbot',

  'strategies.crossover_vwap': require('./strategy'),
  'strategies.list[]': '#strategies.crossover_vwap'
}
