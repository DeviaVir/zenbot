var o = require('object-get')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var c = get('config')
    var tick = g.tick, rs = g.rs
    // get rsi
    var rsi_tick_id = tb(tick.time).resize(c.rsi_reporter_size).toString()
    get('ticks').load(get('app_name') + ':' + rsi_tick_id, function (err, rsi_tick) {
      if (err) return cb(err)
      var rsi = o(rsi_tick || {}, rs.selector + '.rsi')
      if (rsi) {
        var line = 'RSI:'.grey + z(3, rsi.ansi)
        g.cols.push(line)
        rs.rsi = rsi
      }
      else {
        g.cols.push('RSI:n/a'.grey)
      }
      cb()
    })
  }
}