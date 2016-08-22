var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  var format_currency = get('utils.format_currency')
  return function reporter_col (g, cb) {
    var c = get('config')
    var close = o(g.tick, 'data.trades.' + c.price_reporter_selector + '.close')
    if (close) {
      var currency = c.price_reporter_selector.split('-')[1]
      var line = 'CLOSE:'.grey + z(c.price_reporter_length, format_currency(close, currency)).yellow + ' ' + currency.grey
      g.cols.push(line)
    }
    cb()
  }
}