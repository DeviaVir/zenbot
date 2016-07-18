module.exports = {
  _ns: 'zenbot',
  'exchanges[]': require('./exchange.json'),
  'backfillers[]': require('./backfiller'),
  'recorders[]': require('./recorder'),
  'traders[]': require('./trader')
}