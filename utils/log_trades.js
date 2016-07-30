var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  return function log_trades (slug, trades) {
    if (!trades.length) return
    trades = trades.slice().sort(function (a, b) {
      if (a.size > b.size) return -1
      if (a.size < b.size) return 1
      return 0
    })
    var min_time
    var ticker = trades.slice(0, 1).map(function (trade) {
      min_time = min_time ? Math.min(min_time, trade.time) : trade.time
      return z(4, (trade.side === 'buy' ? 'SELL' : 'BUY') , ' ')[trade.side === 'buy' ? 'red' : 'green'] + ' ' + z(9, n(trade.size).format('0.000'), ' ')[trade.side === 'buy' ? 'red' : 'green'] + ' ' + c.asset.grey + ' at '.grey + z(9, n(trade.price).format('0.000'), ' ').yellow + ' ' + c.currency.grey
    }).join(', ')
    ticker = get_timestamp(min_time).grey + ' ' + ticker
    get('logger').info(z(c.max_slug_length, slug, ' '), 'processed'.grey + z(5, trades.length, ' ') + ' trades. '.grey + ticker)
  }
}