var colors = require('colors')
  , n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function reporter (tick, cb) {
    if (tick.size !== c.brain_speed) return cb()
    var rs = get('run_state')
    var tick_str = tick.id.split(':')[1]
    tick_str = tick_str.substring(0, tick_str.length - 2).grey + tick_str.substring(tick_str.length - 2).cyan
    var slug = z(c.max_slug_length, 'reporter', ' ')
    //console.error("slug", slug)
    get('logger').info(slug, tick_str, String(tick.trades.trades).grey, n(tick.trades.vol).format('0.000').white, n(tick.trades.avg_price).format('0.00').yellow, c.currency.grey)
    cb()
  }
}