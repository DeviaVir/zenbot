var colors = require('colors')
  , n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  return function reporter (tick, cb) {
    var rs = get('run_state')
    var tick_str = z(12, tick.id.split(':')[1], ' ')
    tick_str = tick_str.substring(0, tick_str.length - 2).grey + tick_str.substring(tick_str.length - 2).cyan
    var slug = z(c.max_slug_length, 'reporter', ' ')
    var rsi = ''
    if (rs.rsi && rs.rsi[tick.size]) {
      if (rs.rsi[tick.size].tick_id === tick.id) {
        rsi = 'RSI:'.grey + rs.rsi[tick.size].ansi
      }
    }
    get('logger').info(slug, tick_str, z(6, tick.trades.trades, ' '), get_timestamp(tick.time).grey, n(tick.trades.vol).format('0.000').white, n(tick.trades.typical).format('0.00').yellow, c.currency.grey, rsi)
    cb()
  }
}