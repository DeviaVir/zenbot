var n = require('numbro')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function thinker (tick, cb) {
    var rs = get('run_state')
    rs.rsi || (rs.rsi = {})
    rs.rsi[tick.size] || (rs.rsi[tick.size] = {samples: 0})
    rs = rs.rsi[tick.size]
    rs.ansi = ''
    if (!tick.trades) return cb()
    rs.samples++
    rs.close_lookback || (rs.close_lookback = [])
    rs.close_lookback.push(tick.trades.close)
    var last_close = rs.close_lookback[rs.close_lookback.length - 2]
    var current_gain = tick.trades.close > last_close ? n(tick.trades.close).subtract(last_close).value() : 0
    var current_loss = tick.trades.close < last_close ? n(last_close).subtract(tick.trades.close).value() : 0
    if (rs.close_lookback.length > c.rsi_periods) {
      rs.close_lookback.splice(0, rs.close_lookback.length - c.rsi_periods)
    }
    var last_close = 0
    var gain_sum = rs.close_lookback.reduce(function (prev, curr) {
      if (!last_close) {
        last_close = curr
        return 0
      }
      var gain = curr > last_close ? curr - last_close : 0
      last_close = curr
      return prev + gain
    }, 0)
    var avg_gain = n(gain_sum).divide(rs.close_lookback.length).value()
    last_close = 0
    var loss_sum = rs.close_lookback.reduce(function (prev, curr) {
      if (!last_close) {
        last_close = curr
        return 0
      }
      var loss = curr < last_close ? last_close - curr : 0
      last_close = curr
      return prev + loss
    }, 0)
    var avg_loss = n(loss_sum).divide(rs.close_lookback.length).value()
    rs.avg_lookback || (rs.avg_lookback = [])
    rs.avg_lookback.push({
      avg_gain: avg_gain,
      avg_loss: avg_loss
    })
    if (rs.avg_lookback.length > c.rsi_periods - 1) {
      rs.avg_lookback.splice(0, rs.avg_lookback.length - c.rsi_periods - 1)
    }
    var gain_sum_2 = rs.avg_lookback.reduce(function (prev, curr) {
      return prev + curr.avg_gain
    }, current_gain)
    var avg_gain_2 = n(gain_sum_2).divide(rs.avg_lookback.length).value()
    var loss_sum_2 = rs.avg_lookback.reduce(function (prev, curr) {
      return prev + curr.avg_loss
    }, current_loss)
    var avg_loss_2 = n(loss_sum_2).divide(rs.avg_lookback.length).value()
    if (avg_loss_2 === 0) {
      rs.rsi = avg_gain_2 ? 100 : 50
    }
    else {
      var relative_strength = n(avg_gain_2).divide(avg_loss_2).value()
      rs.rsi = n(100).subtract(n(100).divide(n(1).add(relative_strength))).value()
    }
    rs.ansi = n(rs.rsi).format('0')[rs.rsi > 70 ? 'green' : rs.rsi < 30 ? 'red' : 'white']
    cb()
  }
}