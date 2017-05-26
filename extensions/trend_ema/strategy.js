var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'trend_ema',
    description: 'Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.',

    getOptions: function () {
      this.option('period', 'period length', String, '5m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('trend_ema', 'number of periods for trend EMA', Number, 34)
      this.option('oversold_rsi_periods', 'number of periods for oversold RSI', Number, 40)
      this.option('oversold_rsi', 'buy when RSI reaches this value', Number, 28)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
      if (s.options.oversold_rsi) {
        // sync RSI display with oversold RSI periods
        s.options.rsi_periods = s.options.oversold_rsi_periods
        get('lib.rsi')(s, 'oversold_rsi', s.options.oversold_rsi_periods)
        if (s.period.oversold_rsi <= s.options.oversold_rsi && !s.oversold) {
          s.oversold = true
          //console.log(('\noversold at ' + s.period.oversold_rsi + ' RSI, preparing to buy\n').cyan)
        }
      }
      if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
        s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
        get('lib.stddev')(s, 'trend_ema_stddev', Math.floor(s.options.trend_ema / 2), 'trend_ema_rate')
      }
    },

    onPeriod: function (s, cb) {
      if (!s.in_preroll && typeof s.period.oversold_rsi === 'number') {
        if (s.oversold) {
          s.oversold = false
          s.trend = 'oversold'
          s.signal = 'buy'
          s.cancel_down = true
          return cb()
        }
      }
      if (typeof s.period.trend_ema_stddev === 'number') {
        if (s.period.trend_ema_rate > s.period.trend_ema_stddev) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'up'
          s.signal = !s.acted_on_trend ? 'buy' : null
          s.cancel_down = false
        }
        else if (!s.cancel_down && s.period.trend_ema_rate < (s.period.trend_ema_stddev * -1)) {
          if (s.trend !== 'down') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'down'
          s.signal = !s.acted_on_trend ? 'sell' : null
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (typeof s.period.trend_ema_stddev === 'number') {
        var color = 'grey'
        if (s.period.trend_ema_rate > s.period.trend_ema_stddev) {
          color = 'green'
        }
        else if (s.period.trend_ema_rate < (s.period.trend_ema_stddev * -1)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[color])
        cols.push(z(8, n(s.period.trend_ema_stddev).format('0.0000'), ' ').grey)
      }
      else {
        cols.push('                  ')
      }
      return cols
    }
  }
}