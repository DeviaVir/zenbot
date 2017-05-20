module.exports = function container (get) {
  return get('db.createCollection')('periods')
}