var formatmicro = require('formatmicro').default

module.exports = function container (get, set, clear) {
  return function get_duration (interval_us) {
    return formatmicro(interval_us).replace(/([0-9]+) /g, '$1')
  }
}