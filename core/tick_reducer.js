var n = require('numbro')
  , z = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var exchange_defaults = get('exchange_defaults')
  return function tick_reducer (g, cb) {
    var tick = g.tick, sub_tick = g.sub_tick
    //get('logger').info('tick_reducer', tick.id)
    tick.data.trades || (tick.data.trades = {})
    var s = sub_tick.data.trades
    if (!s) return cb(null, g)
    var d = tick.data.trades
    Object.keys(s).forEach(function (e) {
      d[e] || (d[e] = {})
      Object.keys(s[e]).forEach(function (pair) {
        d[e][pair] || (d[e][pair] = exchange_defaults())
        var de = d[e][pair]
        var se = s[e][pair]
        de.volume = n(de.volume).add(se.volume).value()
        de.count = n(de.count).add(se.count).value()
        de.buy_count = n(de.buy_count).add(se.buy_count).value()
        de.buy_volume = n(de.buy_volume).add(se.buy_volume).value()
        de.buy_ratio = n(de.buy_volume).divide(de.volume).value()
        if (de.buy_ratio > 0.5) {
          de.side = 'BUY'
        }
        else if (de.buy_ratio < 0.5) {
          de.side = 'SELL'
        }
        else {
          de.side = 'EVEN'
        }
        var ratio = de.buy_ratio
        if (de.side === 'SELL') {
          ratio = n(1)
            .subtract(ratio)
            .value()
        }
        de.side_volume = n(de.volume)
          .multiply(ratio)
          .value()
        if (de.open === null || se.open_time < de.open_time) {
          de.open = se.open
          de.open_time = se.open_time
        }
        de.high = de.high === null ? se.high : Math.max(se.high, de.high)
        de.low = de.low === null ? se.low : Math.min(se.low, de.low)
        if (de.close === null || se.close_time > de.close_time) {
          de.close = se.close
          de.close_time = se.close_time
        }
        de.typical_price = n(de.high)
          .add(de.low)
          .add(de.close)
          .divide(3)
          .value()
      })
    })
    cb(null, g)
  }
}