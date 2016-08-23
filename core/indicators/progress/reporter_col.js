var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var c = get('config')
    var line = g.rs.trend ? ('trend:' + g.rs.trend).grey + (g.rs.progress && g.rs.progress < 1 ? ', HOLD progress '.grey + z(4, n(g.rs.progress).format('0%')).yellow : '') : '(no trend)'.grey
    g.cols.push(line)
    cb()
  }
}