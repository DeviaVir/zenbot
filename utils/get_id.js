var crypto = require('crypto')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  return function get_id () {
    return crypto.randomBytes(c.id_bytes).toString('hex')
  }
}