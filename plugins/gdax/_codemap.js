module.exports = {
  _ns: 'zenbot',
  _folder: 'exchanges',
  'gdax': require('./exchange'),
  'gdax.backfill_trades': require('./backfill_trades'),
  'gdax.record_trades': require('./record_trades'),
  'gdax.trader': require('./trader'),
  'zenbot:exchanges[]': '#exchanges.gdax'
}