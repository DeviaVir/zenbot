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
      var de = d[e][pair]
      de.volume = n(de.volume).add(trade.size).value()
      de.count++
      if (trade.side === 'sell') {
        de.buy_count++
        de.buy_volume = n(de.buy_volume).add(trade.size).value()
      }
      if (de.open === null || trade.time < de.open_time) {
        de.open = trade.price
        de.open_time = trade.time
      }
      de.high = de.high === null ? trade.price : Math.max(trade.price, de.high)
      de.low = de.low === null ? trade.price : Math.min(trade.price, de.low)
      if (!de.close || trade.time > de.close_time) {
        de.close = trade.price
        de.close_time = trade.time
      }
    })
    cb(null, g)
  }
}