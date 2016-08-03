var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var trades_processed = []
  var c = get('config')
  var log_trades = get('utils.log_trades')
  setInterval(function () {
    if (trades_processed.length) {
      log_trades('reducer', trades_processed)
      trades_processed = []
    }
  }, c.reducer_report_interval)
  return function reducer (t, cb) {
    var tick = t.tick, thoughts = t.thoughts
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
    var trades = thoughts.filter(function (thought) {
      return thought.key === 'trade'
    }).map(function (thought) {
      return thought.value
    })
    trades.forEach(function (trade) {
      trades_processed.push(trade)
      tick.exchanges[trade.exchange] || (tick.exchanges[trade.exchange] = {
        vol: 0,
        trades: 0,
        buys: 0,
        buy_vol: 0,
        high: 0,
        low: 100000,
        open: null,
        close: null,
        close_time: null
      })
      var x = tick.exchanges[trade.exchange]
      x.vol = n(x.vol).add(trade.size).value()
      tick.vol = n(tick.vol).add(trade.size).value()
      x.trades++
      tick.trades++
      if (trade.side === 'sell') {
        x.buys++
        tick.buys++
        x.buy_vol = n(x.buy_vol).add(trade.size).value()
        tick.buy_vol = n(tick.buy_vol).add(trade.size).value()
      }
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
      if (!x.open || trade.time < x.open_time) {
        x.open = trade.price
        x.open_time = trade.time
      }
      if (!tick.open || x.open_time < tick.open_time) {
        tick.open = x.open
        tick.open_time = x.open_time
      }
      x.high = Math.max(trade.price, x.high)
      tick.high = Math.max(tick.high, x.high)
      x.low = Math.min(trade.price, x.low)
      tick.low = Math.min(tick.low, x.low)
      if (!x.close_time || trade.time > x.close_time) {
        x.close = trade.price
        x.close_time = trade.time
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