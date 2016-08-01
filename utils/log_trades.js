var n = require('numbro')
  , z = require('zero-fill')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  return function log_trades (slug, trades, tick_id) {
    if (!trades.length) return
    var rs = get('run_states')
    var min_time
    var vol = 0, buy_vol = 0, total_price = 0
    var max_time
    trades.forEach(function (trade) {
      vol = n(vol).add(trade.size).value()
      if (trade.side === 'sell') {
        buy_vol = n(buy_vol).add(trade.size).value()
      }
      total_price = n(total_price).add(trade.price).value()
      max_time = max_time ? Math.max(max_time, trade.time) : trade.time
    })
    var avg_price = n(total_price).divide(trades.length)
    var buy_ratio = n(buy_vol).divide(vol).value()
    var dominant_side = z(4, buy_ratio < 0.5 ? 'SELL' : 'BUY', ' ')
    var dominant_vol = (buy_ratio < 0.5 ? n(vol).subtract(buy_vol) : n(buy_vol)).format('0.000')
    var ticker = (dominant_side + ' ' + z(9, dominant_vol, ' '))[buy_ratio < 0.5 ? 'red' : 'green'] + ' at '.grey + z(9, n(avg_price).format('0.00'), ' ').yellow + ' ' + c.currency.grey
    ticker = get_timestamp(min_time).grey + ' ' + ticker
    var tick_str = tick_id ? tick_id : tb(max_time).resize(c.brain_speed).toString()
    tick_str = tick_str.substring(0, tick_str.length - 2).grey + tick_str.substring(tick_str.length - 2).cyan
    get('logger').info(z(c.max_slug_length, slug, ' '), tick_str + z(5, trades.length, ' ') + ' trades. '.grey + ticker)
  }
}