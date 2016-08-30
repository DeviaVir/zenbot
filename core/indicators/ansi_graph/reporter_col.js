var colors = require('colors')
  , n = require('numbro')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  var o = get('utils.object_get')
  return function reporter_col (g, cb) {
    var c = get('config')
    var rs = g.rs
    if (rs.rsi) {
      var half = c.ansi_graph_width / 2
      var bar = ''
      try {
        if (rs.rsi.value > 50) {
          bar += ' '.repeat(half)
          // RSI 90 is full +
          var stars = rs.rsi.value > 100 ? half : Math.round(((rs.rsi.value - 50) / 50) * half)
          bar += '+'.repeat(stars).green.bgGreen
          bar += ' '.repeat(half - stars)
        }
        else if (rs.rsi.value < 50) {
          // RSI 10 is full -
          var stars = rs.rsi.value < 0 ? half : Math.round(((50 - rs.rsi.value) / 50) * half)
          bar += ' '.repeat(half - stars)
          bar += '-'.repeat(stars).red.bgRed
          bar += ' '.repeat(half)
        }
        else {
          bar += ' '.repeat(half * 2)
        }
      }
      catch (e) {
        bar = ' '.repeat(c.ansi_graph_width)
      }
      g.cols.push(bar)
    }
    else {
      g.cols.push(' '.repeat(c.ansi_graph_width))
    }
    cb()
  }
}