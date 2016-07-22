var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')
  , parallel = require('run-parallel')
  , zerofill = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  return function create_tick (tick, trades, cb) {
    if (!trades.length) return cb()
    trades.sort(function (a, b) {
      if (a.time < b.time) return -1
      if (a.time > b.time) return 1
      return 0
    })
    var new_trades = false
    trades.forEach(function (trade) {
      if (tick.trade_ids.indexOf(trade.id) !== -1) return
      new_trades = true
      assert(tb(trade.time).resize(tick.size).toString() === tick.id)
      tick.trade_ids.push(trade.id)
      tick.min_time = tick.min_time ? Math.min(tick.min_time, trade.time) : trade.time
      tick.max_time = tick.max_time ? Math.max(tick.max_time, trade.time) : trade.time
      tick.exchanges[trade.exchange] || (tick.exchanges[trade.exchange] = {
        vol: 0,
        trades: 0,
        buys: 0,
        buy_vol: 0,
        high: 0,
        low: 100000,
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
      if (!x.open) {
        x.open = trade.price
      }
      x.high = Math.max(trade.price, x.high)
      tick.high = Math.max(tick.high, x.high)
      x.low = Math.min(trade.price, x.low)
      tick.low = Math.min(tick.low, x.low)
      if (!x.close_time || trade.time > x.close_time) {
        x.close_time = trade.time
        x.close = trade.price
      }
      if (!tick.close_time || x.close_time > tick.close_time) {
        tick.close_time = x.close_time
        tick.close = x.close
      }
      x.typical = n(x.high)
        .add(x.low)
        .add(x.close)
        .divide(3)
        .value()
    })
    if (!new_trades) {
      return cb()
    }
    tick.buy_ratio = n(tick.buy_vol)
      .divide(tick.vol)
      .value()
    if (tick.buy_ratio > 0.5) {
      tick.side = 'BUY'
    }
    else if (tick.buy_ratio <= 0.5) {
      tick.side = 'SELL'
    }
    var ratio = tick.buy_ratio
    if (tick.side === 'SELL') {
      ratio = n(1)
        .subtract(ratio)
        .value()
    }
    tick.side_vol = n(tick.vol)
      .multiply(ratio)
      .value()
    var prices = []
    Object.keys(tick.exchanges).forEach(function (exchange) {
      var x = tick.exchanges[exchange]
      if (x.typical) {
        prices.push(x.typical)
      }
    })
    if (prices.length) {
      var total = prices.reduce(function (prev, curr) {
        return n(prev).add(curr).value()
      }, 0)
      tick.avg_price = n(total).divide(prices.length).value()
      tick.typical = n(tick.high)
          .add(tick.low)
          .add(tick.close)
          .divide(3)
          .value()
    }
    get('motley:db.ticks').save(tick, function (err, saved) {
      if (err && !get('app').closing) {
        get('logger').error('tick save err', err, {public: false})
      }
      cb()
    })
  }
}