var colors = require('colors')
  , n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function reporter (tick, cb) {
    var rs = get('run_state')
    var tick_str = z(12, tick.id.split(':')[1], ' ')
    tick_str = tick_str.substring(0, tick_str.length - 2).grey + tick_str.substring(tick_str.length - 2).cyan
    var slug = z(c.max_slug_length, 'reporter', ' ')
    //console.error("slug", slug)
    get('logger').info(slug, tick_str, z(6, tick.trades.trades, ' '), n(tick.trades.vol).format('0.000').white, n(tick.trades.typical).format('0.00').yellow, c.currency.grey, 'RSI:'.grey + rs.rsi[c.brain_speed].ansi)
    cb()
  }
}