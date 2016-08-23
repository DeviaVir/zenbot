

var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  var get_duration = get('utils.get_duration')
  return function reporter_col (g, cb) {
    var c = get('config')
    var tick = g.tick, rs = g.rs
    if (rs.trend === 'DOWN' && rs.last_action_time && tick.time - rs.last_action_time > 0 && tick.time - rs.last_action_time <= rs.min_sell_wait) {
      g.cols.push(('ETA2SELL: ' + z(7, get_duration(n(rs.min_sell_wait).subtract(n(tick.time).subtract(rs.last_action_time)).multiply(1000).value()), ' ')).grey)
    }
    else if (rs.trend === 'UP' && rs.last_action_time && tick.time - rs.last_action_time > 0 && tick.time - rs.last_action_time <= rs.min_buy_wait) {
      g.cols.push(('ETA2BUY: ' + z(7, get_duration(n(rs.min_sell_wait).subtract(n(tick.time).subtract(rs.last_action_time)).multiply(1000).value()), ' ')).grey)
    }
    cb()
  }
}