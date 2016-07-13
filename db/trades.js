var n = require('numbro')

module.exports = function container (get, set) {
  return get('db.createCollection')('trades')
}