module.exports = {
  _ns: 'zenbot',
  _folder: 'exchanges',
  'gdax': require('./exchange.json'),
  'zenbot:exchanges[]': '#exchanges.gdax',
  'gdax.backfiller': require('./backfiller')
}