var o = require('object-get')
  , colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var format_currency = get('utils.format_currency')
  return function reporter_col (g, cb) {
    var roi = g.rs.roi
    var line = 'ROI:'.grey + (roi ? n(roi).format('0.000').white : 'n/a'.grey)
    g.cols.push(line)
    cb()
  }
}