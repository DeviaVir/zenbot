var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var trades_processed = []
  var c = get('config')
  var log_trades = get('utils.log_trades')
  var tick_defaults = get('tick_defaults')
  setInterval(function () {
    if (trades_processed.length) {
      log_trades('reducer', trades_processed)
      trades_processed = []
    }
    else {
      //console.error('no trade processed')
    }
  }, c.trade_report_interval)
  return function thought_reducer (g, cb) {
    var tick = g.tick, thoughts = g.thoughts
    //get('logger').info('trade_reducer', g.bucket.id)
    tick.data.trades || (tick.data.trades = {})
    var d = tick.data.trades
    thoughts.forEach(function (thought) {
      if (thought.key !== 'trade') {
        return
      }
      var trade = thought.value
      trades_processed.push(trade)
      var e = trade.exchange
      d[e] || (d[e] = {})
      var pair = trade.asset + '-' + trade.currency
      d[e][pair] || (d[e][pair] = tick_defaults())
      var x = d[e][pair]
      x.volume = n(x.volume).add(trade.size).value()
      x.count++
      if (trade.side === 'sell') {
        x.buy_count++
        x.buy_volume = n(x.buy_volume).add(trade.size).value()
      }
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
    })
    cb(null, g)
  }
}