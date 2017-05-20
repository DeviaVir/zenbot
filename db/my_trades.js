module.exports = function container (get) {
  return get('db.createCollection')('my_trades')
}