var n = require('numbro')
  , z = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  return function tick_reducer (tick, cb) {
    var queue = tick.queue
    get('logger').info('tick_reducer', tick.id)
    tick.data.trades || (tick.data.trades = {
      volume: 0,
      count: 0,
      exchanges: {}
    })
    tick = tick.data.trades
    queue.forEach(function (sub_tick) {
      sub_tick = sub_tick.data.trades
      if (!sub_tick) return
      Object.keys(sub_tick.exchanges).forEach(function (slug) {
        tick.exchanges[slug] || (tick.exchanges[slug] = {
          volume: 0,
          count: 0,
          buy_count: 0,
          buy_volume: 0,
          buy_ratio: null,
          side: null,
          side_volume: null,
          open: null,
          open_time: null,
          high: null,
          low: null,
          close: null,
          close_time: null,
          typical_price: null
        })
        var x = tick.exchanges[slug]
        var s = sub_tick.exchanges[slug]
        x.volume = n(x.volume).add(s.volume).value()
        tick.volume = n(tick.volume).add(sub_tick.volume).value()
        x.count = n(x.count).add(s.count).value()
        tick.count = n(tick.count).add(sub_tick.count).value()
        x.buy_count = n(x.buy_count).add(s.buy_count).value()
        x.buy_volume = n(x.buy_volume).add(s.buy_volume).value()
        x.buy_ratio = n(x.buy_volume)
          .divide(x.volume)
          .value()
        if (x.buy_ratio > 0.5) {
          x.side = 'BUY'
        }
        else if (x.buy_ratio < 0.5) {
          x.side = 'SELL'
        }
        else {
          x.side = 'EVEN'
        }
        var ratio = x.buy_ratio
        if (x.side === 'SELL') {
          ratio = n(1)
            .subtract(ratio)
            .value()
        }
        x.side_volume = n(x.volume)
          .multiply(ratio)
          .value()
        if (x.open === null || s.open_time < x.open_time) {
          x.open = s.open
          x.open_time = s.open_time
        }
        x.high = x.high === null ? s.high : Math.max(s.high, x.high)
        x.low = x.low === null ? s.low : Math.min(s.low, x.low)
        if (x.close === null || s.close_time > x.close_time) {
          x.close = s.close
          x.close_time = s.close_time
        }
        x.typical_price = n(x.high)
          .add(x.low)
          .add(x.close)
          .divide(3)
          .value()
      })
    })
    cb()
  }
}