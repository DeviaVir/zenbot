var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function reporter (tick, cb) {
    if (tick.size !== c.brain_speed) return cb()
    var rs = get('run_state')
    get('logger').info('reporter', tick.id.grey, String(tick.trades.trades).green, n(tick.trades.vol).format('0.000').white)
    cb()
  }
}