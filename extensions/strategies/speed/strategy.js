var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'speed',
    description: 'Trade when % change from last N periods reaches a threshold.',

    getOptions: function () {
      this.option('period', 'period length', String, '1m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('lookback', 'lookback periods to judge trend speed', Number, 2)
      this.option('buy_rate', 'buy when speed reaches this % change', Number, 0.9)
      this.option('sell_rate', 'sell when speed reaches this % change', Number, -0.6)
    },

    calculate: function (s) {
      if (s.lookback[s.options.lookback - 1]) {
        s.period.speed = (s.period.close - s.lookback[s.options.lookback - 1].close) / s.lookback[s.options.lookback - 1].close * 100
      }
    },

    onPeriod: function (s, cb) {
      if (typeof s.period.speed === 'number') {
        if (s.period.speed >= s.options.buy_rate) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
          }
          s.trend = 'up'
          s.signal = !s.acted_on_trend ? 'buy' : null
        }
        else if (s.period.speed <= s.options.sell_rate) {
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
      if (typeof s.period.speed === 'number') {
        cols.push(z(8, n(s.period.speed).format('0.0000'), ' ')[s.trend === 'up' ? 'green' : 'red'])
      }
      return cols
    }
  }
}