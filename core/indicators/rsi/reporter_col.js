var o = require('object-get')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var tick = g.tick, rs = g.rs
    if (!rs.rsi_period || !rs.selector) return cb()
    // get rsi
    var rsi_tick_id = tb(tick.time).resize(rs.rsi_period).toString()
    get('ticks').load(get('app_name') + ':' + rs.rsi_tick_id, function (err, rsi_tick) {
      if (err) return cb(err)
      var rsi = o(rsi_tick || {}, rs.selector + '.rsi')
      if (rsi) {
        var line = (rs.rsi_period + ' RSI').grey + z(3, rsi.ansi) + 'x'.grey + z(2, rsi.samples).grey
        g.cols.push(line)
      }
      else {
        g.cols.push(z(10, ' '))
      }
      cb()
    })
  }
}