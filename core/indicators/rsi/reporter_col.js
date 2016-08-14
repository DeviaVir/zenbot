var o = require('object-get')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var rsi = o(g.tick, 'data.trades.' + c.rsi_reporter_selector + '.rsi')
    if (rsi) {
      var line = ' RSI'.grey + z(3, rsi.ansi) + 'x'.grey + z(2, rsi.samples).grey
      g.cols.push(line)
    }
    else {
      g.cols.push(z(10, ' '))
    }
    cb()
  }
}