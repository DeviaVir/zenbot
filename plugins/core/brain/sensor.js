var n = require('numbro')
  , z = require('zero-fill')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  return function sensor (tick, cb) {
    var rs = get('run_state')
    tick.seen = true
    get('logger').info('sensor', tick.id)
    if (tick.size !== c.brain_speed) return cb()
    rs.high = Math.max(rs.high, tick.high)
    rs.low = Math.min(rs.low, tick.low)
    rs.arrow = rs.last_tick ? (rs.last_tick.close < tick.close ? '↗'.green : '↘'.red) : ' '
    rs.uptick = rs.last_tick ? (rs.last_tick.close < tick.close ? true : false) : null
    rs.last_tick = tick
    cb()
  }
}