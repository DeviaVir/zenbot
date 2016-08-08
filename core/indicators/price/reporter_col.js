var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var get_currency_format = get('utils.get_currency_format')
  return function reporter_col (g, cb) {
    var close = o(g.tick, 'data.trades.' + c.price_reporter_selector + '.close')
    if (close) {
      var currency = c.price_reporter_selector.split('-')[1]
      var format = get_currency_format(currency)
      var line = z(c.price_reporter_length, n(close).format(format)).yellow
      g.cols.push(line)
    }
    cb()
  }
}