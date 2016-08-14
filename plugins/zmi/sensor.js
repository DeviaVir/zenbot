var n = require('numbro')
  , z = require('zero-fill')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  var strategy = get('strategies.zmi')
  return function sensor (tick, cb) {
    var rs = get('run_state')
    if (tick.size !== c.brain_speed) return cb()
    rs.zmi_vol || (rs.zmi_vol = 0)
    rs.zmi_vol = n(rs.zmi_vol)
      .multiply(strategy.vol_decay)
      .value()
    if (rs.zmi_side && tick.side !== rs.zmi_side) {
      rs.zmi_vol = n(rs.zmi_vol)
        .subtract(n(tick.vol).multiply(tick.side === 'BUY' ? strategy.buy_factor : strategy.sell_factor))
        .value()
      if (rs.zmi_vol < 0) rs.side = tick.side
      rs.zmi_vol = Math.abs(rs.zmi_vol)
    }
    else {
      rs.side = tick.side
      rs.zmi_vol = n(rs.zmi_vol)
        .add(n(tick.vol).multiply(tick.side === 'BUY' ? strategy.buy_factor : strategy.sell_factor))
        .value()
    }
    if (Math.floor(rs.zmi_vol) > Math.ceil(rs.zmi_max_vol)) {
      rs.zmi_new_max_vol = true
      rs.zmi_max_vol = rs.zmi_vol
    }
    else {
      rs.new_max_vol = false
    }
    rs.zmi_vol_string = z(6, Math.floor(rs.zmi_vol), ' ')[rs.zmi_new_max_vol ? 'cyan' : 'white']
    rs.zmi_vol_diff_string = rs.zmi_vol_string + ('/' + Math.ceil(strategy.min_vol)).grey + ' ' + (rs.side === 'BUY' ? 'BULL'.green : 'BEAR'.red)
    cb()
  }
}