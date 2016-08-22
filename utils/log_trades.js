var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var get_timestamp = get('utils.get_timestamp')
  var get_tick_str = get('utils.get_tick_str')
  var app_name = get('app_name')
  var format_currency = get('utils.format_currency')
  var z = get('utils.zero_fill')
  return function log_trades (slug, trades) {
    var c = get('config')
    if (!c.trade_log || trades.length < c.min_log_trades) return
    var rs = get('run_states')
    var vol = 0, buy_vol = 0, total_price = 0
    var max_time, asset, currency
    trades.forEach(function (trade) {
      asset = trade.asset
      currency = trade.currency
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
    var ticker = (dominant_side + ' ' + z(12, dominant_vol, ' ')).grey + ' at '.grey + z(12, format_currency(avg_price, currency), ' ').grey + ' ' + (asset + '/' + currency).grey
    ticker = get_timestamp(max_time).grey + ' ' + ticker
    var tick_str = get_tick_str(app_name + ':' + tb(max_time).resize(c.bucket_size).toString())
    get('logger').info(slug, z(12, tick_str), z(7, trades.length, ' '), 'trades.'.grey, ticker)
  }
}