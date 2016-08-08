var o = require('object-get')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var get_tick_str = get('utils.get_tick_str')
  return function reporter_col (g, cb) {
    g.cols.push(z(11, get_tick_str(g.tick.id)))
    cb()
  }
}