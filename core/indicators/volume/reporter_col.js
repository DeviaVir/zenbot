var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var c = get('config')
    var d = g.tick.data.trades, keys = Object.keys(d)
    var volume = keys.reduce(function (prev, e) {
      return prev + Object.keys(d[e]).reduce(function (prev, pair) {
        return prev + d[e][pair].volume
      }, 0)
    }, 0)
    g.cols.push(z(6, n(volume).format('0.000')).white)
    cb()
  }
}