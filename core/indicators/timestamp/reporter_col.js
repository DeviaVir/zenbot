var colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var get_timestamp = get('utils.get_timestamp')
  return function reporter_col (g, cb) {
    g.cols.push(get_timestamp(g.tick.time).grey)
    cb()
  }
}