var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    getOptions: function () {
      this.option('period', 'period length', String, '1h')
      this.option('min_periods', 'min. number of history periods', Number, 36)
      this.option('trend_ema', 'number of periods for trend ema', Number, 36)
      this.option('min_buy_rate', 'buy if trend ema rate over this float', Number, 0)
      this.option('max_buy_rate', 'avoid buy if trend ema rate over this float', Number, 10)
      this.option('min_sell_rate', 'sell if trend ema under this float', Number, 0)
      this.option('max_sell_rate', 'avoid sell if trend ema under this float', Number, -0.02)
    },

    onPeriod: function (s, cb) {
      get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
      if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
        if (s.period.trend_ema / s.lookback[0].trend_ema >= 1) {
          s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
        }
        else {
          s.period.trend_ema_rate = (s.lookback[0].trend_ema - s.period.trend_ema) / s.period.trend_ema * -100
        }
      }
      if (s.period.trend_ema_rate && s.lookback[0] && s.lookback[0].trend_ema_rate) {
        if (s.period.trend_ema_rate >= s.options.min_buy_rate) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
          }
          s.trend = 'up'
          s.signal = s.period.trend_ema_rate < s.options.max_buy_rate && !s.acted_on_trend ? 'buy' : null
        }
        else if (s.period.trend_ema_rate <= s.options.min_sell_rate) {
          if (s.trend !== 'down') {
            s.acted_on_trend = false
          }
          s.trend = 'down'
          s.signal = s.period.trend_ema_rate > s.options.max_sell_rate && !s.acted_on_trend ? 'sell' : null
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (s.period.trend_ema_rate) {
        cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[s.period.trend_ema_rate >= 0 ? 'green' : 'red'])
      }
      else {
        cols.push('         ')
      }
      return cols
    }
  }
}