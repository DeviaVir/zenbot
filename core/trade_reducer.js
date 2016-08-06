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
    else {
      //console.error('no trade processed')
    }
  }, c.reducer_report_interval)
  return function thought_reducer (g, cb) {
    //get('logger').info('trade_reducer', g.bucket.id)
    var bucket = g.bucket, thoughts = g.thoughts
    if (typeof bucket.data.trades === 'undefined') {
      bucket.data.trades = {
        volume: 0,
        count: 0,
        exchanges: {}
      }
    }
    var t = bucket.data.trades
    thoughts.forEach(function (thought) {
      if (thought.key !== 'trade') {
        return
      }
      var trade = thought.value
      trades_processed.push(trade)
      t.exchanges[trade.exchange] || (t.exchanges[trade.exchange] = {
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
      var x = t.exchanges[trade.exchange]
      x.volume = n(x.volume).add(trade.size).value()
      t.volume = n(t.volume).add(trade.size).value()
      x.count++
      t.count++
      if (trade.side === 'sell') {
        x.buy_count++
        x.buy_volume = n(x.buy_volume).add(trade.size).value()
      }
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
      if (x.open === null || trade.time < x.open_time) {
        x.open = trade.price
        x.open_time = trade.time
      }
      x.high = x.high === null ? trade.price : Math.max(trade.price, x.high)
      x.low = x.low === null ? trade.price : Math.min(trade.price, x.low)
      if (!x.close || trade.time > x.close_time) {
        x.close = trade.price
        x.close_time = trade.time
      }
      x.typical_price = n(x.high)
        .add(x.low)
        .add(x.close)
        .divide(3)
        .value()
    })
    cb()
  }
}