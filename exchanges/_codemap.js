module.exports = {
  _ns: 'zenbot',
  _folder: 'exchanges',

  'bitfinex': require('./bitfinex'),
  'bitflyer': require('./bitflyer'),
  'gdax': require('./gdax')
}