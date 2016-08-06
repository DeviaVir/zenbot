var n = require('numbro')
  , colors = require('colors')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function tick_handler (tick, cb) {
    //console.error('rsi', tick.id)
    var rs = get('run_state')
    rs.rsi || (rs.rsi = {})
    rs.rsi[tick.size] || (rs.rsi[tick.size] = {samples: 0})
    rs = rs.rsi[tick.size]
    rs.ansi = ''
    if (!tick.data.trades) {
      //console.error('no trades', tick.id)
      return cb()
    }
    var x = tick.data.trades.exchanges[c.rsi_exchange]
    if (!x) {
      return cb()
    }
    rs.samples++
    rs.close_lookback || (rs.close_lookback = [])
    rs.close_lookback.push(x.close)
    var last_close = rs.close_lookback[rs.close_lookback.length - 2]
    var current_gain = x.close > last_close ? n(x.close).subtract(last_close).value() : 0
    var current_loss = x.close < last_close ? n(last_close).subtract(x.close).value() : 0
    if (rs.close_lookback.length > c.rsi_periods) {
      rs.close_lookback.splice(0, rs.close_lookback.length - c.rsi_periods)
      assert.equal(rs.close_lookback.length, c.rsi_periods)
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
    var avg_gain = n(gain_sum).divide(c.rsi_periods).value()
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
    if (typeof rs.avg_gain === 'undefined') {
      rs.avg_gain = avg_gain
      rs.avg_loss = avg_loss
      return cb()
    }
    var avg_gain_2 = n(rs.avg_gain).multiply(c.rsi_periods - 1).add(current_gain).divide(c.rsi_periods).value()
    var avg_loss_2 = n(rs.avg_loss).multiply(c.rsi_periods - 1).add(current_loss).divide(c.rsi_periods).value()
    rs.avg_gain = avg_gain
    rs.avg_loss = avg_loss
    if (avg_loss_2 === 0) {
      rs.rsi = avg_gain_2 ? 100 : 50
    }
    else {
      var relative_strength = n(avg_gain_2).divide(avg_loss_2).value()
      rs.rsi = n(100).subtract(n(100).divide(n(1).add(relative_strength))).value()
    }
    rs.tick_id = tick.id
    rs.ansi = n(rs.rsi).format('0')[rs.rsi > 70 ? 'green' : rs.rsi < 30 ? 'red' : 'white']
    cb()
  }
}