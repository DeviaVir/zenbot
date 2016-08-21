var o = require('object-get')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  var format_currency = get('utils.format_currency')
  return function reporter_col (g, cb) {
    var tick = g.tick, rs = g.rs
    var sma_tick_id = tb(tick.time).resize(c.sma_reporter_size).toString()
    get('ticks').load(get('app_name') + ':' + sma_tick_id, function (err, sma_tick) {
      if (err) return cb(err)
      var sma = o(sma_tick || {}, 'data.trades.' + c.sma_reporter_selector + '.sma')
      if (sma) {
        var line = 'SMA:'.grey + format_currency(sma.value, rs.currency).grey
        g.cols.push(line)
        rs.sma = sma
      }
      else {
        g.cols.push(z(10, 'SMA:n/a'.grey))
      }
      cb()
    })
  }
}