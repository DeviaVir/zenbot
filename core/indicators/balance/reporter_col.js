var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var format_currency = get('utils.format_currency')
  return function reporter_col (g, cb) {
    var balance = g.rs.consolidated_balance
    var line = 'BAL:'.grey + (balance ? format_currency(balance, g.rs.currency).yellow : 'n/a'.grey)
    g.cols.push(line)
    cb()
  }
}