module.exports = {
  _ns: 'zenbot',
  _folder: 'exchanges',
  'gdax': require('./exchange'),
  'gdax.backfiller': require('./backfiller'),
  'gdax.recorder': require('./recorder'),
  'gdax.trader': require('./trader'),
  'zenbot:exchanges[]': '#exchanges.gdax'
}