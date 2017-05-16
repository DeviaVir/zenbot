var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'trend_ema',

    getOptions: function () {
      this.option('period', 'period length', String, '1h')
      this.option('min_periods', 'min. number of history periods', Number, 36)
      this.option('trend_ema', 'number of periods for trend ema', Number, 34)
      this.option('buy_rate', 'buy if trend ema rate between 0 and this positive float', Number, 0)
      this.option('sell_rate', 'sell if trend ema rate between 0 and this negative float', Number, 0)
      this.option('max_buy_duration', 'avoid buy if trend duration over this number', Number, 1)
      this.option('max_sell_duration', 'avoid sell if trend duration over this number', Number, 1)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
      if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
        s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
      }
    },

    onPeriod: function (s, cb) {
      if (typeof s.period.trend_ema_rate === 'number') {
        if (s.period.trend_ema_rate >= 0) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'up'
          s.signal = (!s.options.buy_rate || s.period.trend_ema_rate <= s.options.buy_rate) && (!s.options.max_buy_duration || s.trend_duration <= s.options.max_buy_duration) && !s.acted_on_trend ? 'buy' : null
        }
        else {
          if (s.trend !== 'down') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'down'
          s.signal = (!s.options.sell_rate || s.period.trend_ema_rate >= s.options.sell_rate) && (!s.options.max_sell_duration || s.trend_duration <= s.options.max_sell_duration) && !s.acted_on_trend ? 'sell' : null
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (typeof s.period.trend_ema_rate === 'number') {
        cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[s.period.trend_ema_rate >= 0 ? 'green' : 'red'])
      }
      else {
        cols.push('         ')
      }
      return cols
    }
  }
}