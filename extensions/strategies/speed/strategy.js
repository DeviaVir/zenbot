var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'speed',
    description: 'Trade when % change from last N periods reaches a threshold.',

    getOptions: function () {
      this.option('period', 'period length', String, '1m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('speed_ema_periods', 'lookback periods to judge speed baseline', Number, 50)
      this.option('speed_mult', 'multiply with avg speed to get trigger value', Number, 1.5)
    },

    calculate: function (s) {
      if (s.lookback[1]) {
        if (s.lookback[1].close < s.period.close) {
          s.period.gain_speed = (s.period.close - s.lookback[1].close) / s.lookback[1].close * 100
          s.period.loss_speed = 0
        }
        else {
          s.period.gain_speed = 0
          s.period.loss_speed = (s.period.close - s.lookback[1].close) / s.lookback[1].close * -100
        }
        if (s.lookback[s.options.speed_ema_periods + 1]) {
          get('lib.ema')(s, 'gain_speed_avg', s.options.speed_ema_periods, 'gain_speed')
          get('lib.ema')(s, 'loss_speed_avg', s.options.speed_ema_periods, 'loss_speed')
        }
      }
    },

    onPeriod: function (s, cb) {
      if (typeof s.period.gain_speed_avg === 'number') {
        if (s.period.gain_speed >= s.period.gain_speed_avg * s.options.speed_mult) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
          }
          s.trend = 'up'
          s.signal = !s.acted_on_trend ? 'buy' : null
        }
        else if (s.period.loss_speed >= s.period.loss_speed_avg * s.options.speed_mult) {
          if (s.trend !== 'down') {
            s.acted_on_trend = false
          }
          s.trend = 'down'
          s.signal = !s.acted_on_trend ? 'sell' : null
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (s.period.loss_speed > s.period.gain_speed) {
        cols.push(z(8, n(s.period.loss_speed).format('0.0000'), ' ').red)
      }
      else {
        cols.push(z(8, n(s.period.gain_speed).format('0.0000'), ' ').green)
      }
      if (typeof s.period.gain_speed_avg === 'number') {
        cols.push(z(8, n(s.period.gain_speed_avg).format('0.0000'), ' ').grey)
        cols.push(z(8, n(s.period.loss_speed_avg).format('0.0000'), ' ').grey)
      }
      return cols
    }
  }
}