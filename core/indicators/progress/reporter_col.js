var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var line = z(4, n(g.rs.progress).format('0%')).yellow
    g.cols.push(line)
    cb()
  }
}