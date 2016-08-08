var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var close = o(g.tick, 'data.trades.' + c.price_reporter_selector + '.close')
    if (close) {
      var line = z(c.price_reporter_length, n(close).format(c.price_reporter_format)).yellow
      g.cols.push(line)
    }
    cb()
  }
}