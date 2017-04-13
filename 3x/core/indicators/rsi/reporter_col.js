var o = require('object-get')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var c = get('config')
    var tick = g.tick, rs = g.rs
    if (rs.rsi) {
      var line = 'RSI:'.grey + z(3, rs.rsi.ansi)
      g.cols.push(line)
    }
    else {
      g.cols.push('RSI:n/a'.grey)
    }
    cb()
  }
}