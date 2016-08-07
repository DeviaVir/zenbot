var z = require('zero-fill')

module.exports = function container (get, set, clear) {
  return function get_tick_str (tick_id) {
    return z(9, tick_id.substring(0, tick_id.length - 2), ' ').grey + tick_id.substring(tick_id.length - 2).cyan
  }
}