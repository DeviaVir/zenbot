var colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var d = g.tick.data.trades
    var keys = Object.keys(d)
    var num_trades = keys.reduce(function (prev, e) {
      return prev + Object.keys(d[e]).reduce(function (prev, pair) {
        return prev + d[e][pair].count
      }, 0)
    }, 0)
    g.cols.push(z(5, num_trades).grey)
    cb()
  }
}