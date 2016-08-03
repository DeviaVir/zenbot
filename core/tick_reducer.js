var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var ticks_processed = 0
  var c = get('config')
  setInterval(function () {
    if (ticks_processed) {
      //get('logger').info(z(c.max_slug_length, 'tick reducer', ' '), 'reduced'.grey, ticks_processed, 'ticks'.grey)
      ticks_processed = 0
    }
  }, c.reducer_report_interval)
  return function reducer (b, cb) {
    var tick = b.tick, ticks = b.ticks
    if (typeof tick.trades === 'undefined') {
      tick.trades = {
        vol: 0,
        trades: 0,
        buys: 0,
        buy_vol: 0,
        exchanges: {},
        high: 0,
        low: 100000,
        close: null,
        close_time: null,
        buy_ratio: null,
        side: null,
        side_vol: null,
        typical: null
      }
    }
    tick = tick.trades
    ticks.forEach(function (sub_tick) {
      sub_tick = sub_tick.trades
      ticks_processed++
      Object.keys(sub_tick.exchanges).forEach(function (slug) {
        tick.exchanges[slug] || (tick.exchanges[slug] = {
          vol: 0,
          trades: 0,
          buys: 0,
          buy_vol: 0,
          high: 0,
          low: 100000,
          open: null,
          open_time: null,
          close: null,
          close_time: null
        })
        var x = tick.exchanges[slug]
        var s = sub_tick.exchanges[slug]
        x.vol = n(x.vol).add(s.vol).value()
        tick.vol = n(tick.vol).add(sub_tick.vol).value()
        x.trades = n(x.trades).add(s.trades).value()
        tick.trades = n(tick.trades).add(sub_tick.trades).value()
        x.buys = n(x.buys).add(s.buys).value()
        tick.buys = n(tick.buys).add(sub_tick.buys).value()
        x.buy_vol = n(x.buy_vol).add(s.buy_vol).value()
        tick.buy_vol = n(tick.buy_vol).add(sub_tick.buy_vol).value()
        x.buy_ratio = n(x.buy_vol)
          .divide(x.vol)
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
        x.side_vol = n(x.vol)
          .multiply(ratio)
          .value()
        if (!x.open || s.open_time < x.open_time) {
          x.open = s.open
          x.open_time = s.open_time
        }
        if (!tick.open || x.open_time < tick.open_time) {
          tick.open = x.open
          tick.open_time = x.open_time
        }
        x.high = Math.max(s.high, x.high)
        tick.high = Math.max(tick.high, sub_tick.high)
        x.low = Math.min(s.low, x.low)
        tick.low = Math.min(tick.low, sub_tick.low)
        if (!x.close_time || s.close_time > x.close_time) {
          x.close = s.close
          x.close_time = s.close_time
        }
        if (!tick.close || x.close_time > tick.close_time) {
          tick.close = x.close
          tick.close_time = x.close_time
        }
        x.typical = n(x.high)
          .add(x.low)
          .add(x.close)
          .divide(3)
          .value()
      })
    })
    if (tick.buy_ratio > 0.5) {
      tick.side = 'BUY'
    }
    else if (tick.buy_ratio < 0.5) {
      tick.side = 'SELL'
    }
    else {
      tick.side = 'EVEN'
    }
    tick.buy_ratio = n(tick.buy_vol)
      .divide(tick.vol)
      .value()
    var ratio = tick.buy_ratio
    if (tick.side === 'SELL') {
      ratio = n(1)
        .subtract(ratio)
        .value()
    }
    tick.side_vol = n(tick.vol)
      .multiply(ratio)
      .value()
    tick.typical = n(tick.high)
      .add(tick.low)
      .add(tick.close)
      .divide(3)
      .value()
    cb()
  }
}