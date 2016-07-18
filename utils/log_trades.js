var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  var config = get('config')
  var get_timestamp = get('utils.get_timestamp')
  return function log_trades (slug, trades) {
    if (!trades.length) return
    trades = trades.slice().sort(function (a, b) {
      if (a.size > b.size) return -1
      if (a.size < b.size) return 1
      return 0
    })
    var min_time
    var ticker = trades.slice(0, c.log_trades_limit).map(function (trade) {
      min_time = min_time ? Math.min(min_time, trade.time) : trade.time
      return z(4, (trade.side === 'buy' ? 'SELL' : 'BUY') , ' ')[trade.side === 'buy' ? 'red' : 'green'] + ' ' + z(9, n(trade.size).format('0.000'), ' ')[trade.side === 'buy' ? 'red' : 'green'] + ' ' + config.asset.grey + ' at '.grey + z(9, n(trade.price).format('0.000'), ' ').yellow + ' ' + config.currency.grey
    }).join(', ')
    ticker = get_timestamp(min_time).grey + ' ' + ticker
    get('logger').info(slug + ' processed ' + z(5, trades.length, ' ') + ' trades. ' + ticker)
  }
}