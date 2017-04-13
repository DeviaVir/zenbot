var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  var format_currency = get('utils.format_currency')
  return function reporter_col (g, cb) {
    var c = get('config')
    var balance = g.rs.consolidated_balance
    var line = (c.default_selector + ' BAL:').grey + z(c.price_reporter_length, (balance ? format_currency(balance, g.rs.currency).yellow : 'n/a'.grey))
    g.cols.push(line)
    cb()
  }
}