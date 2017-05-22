var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'trend_ema',
    description: 'Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.',

    getOptions: function () {
      this.option('period', 'period length', String, '1h')
      this.option('min_periods', 'min. number of history periods', Number, 36)
      this.option('trend_ema', 'number of periods for trend EMA', Number, 34)
      this.option('buy_rate', 'buy if trend EMA rate between neutral_rate and this positive float', Number, 0)
      this.option('sell_rate', 'sell if trend EMA rate between neutral_rate * -1 and this negative float', Number, 0)
      this.option('neutral_rate', 'avoid signals when trend EMA rate is under this absolute value', Number, 'auto')
      this.option('max_buy_duration', 'avoid buy if trend duration over this number', Number, 0)
      this.option('max_sell_duration', 'avoid sell if trend duration over this number', Number, 0)
      this.option('oversold_rsi_periods', 'number of periods for oversold RSI', Number, 14)
      this.option('oversold_rsi', 'buy when RSI reaches this value', Number, 0)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
      if (s.options.oversold_rsi) {
        get('lib.rsi')(s, 'oversold_rsi', s.options.oversold_rsi_periods)
      }
      if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
        s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
      }
    },

    onPeriod: function (s, cb) {
      if (s.options.neutral_rate === 'auto' || s.options.neutral_rate_auto) {
        s.options.neutral_rate_auto = true
        get('lib.stddev')(s, 'trend_ema_stddev', Math.floor(s.options.trend_ema / 2), 'trend_ema_rate')
        if (typeof s.period.trend_ema_stddev === 'number') {
          s.options.neutral_rate = s.period.trend_ema_stddev
        }
      }
      if (!s.in_preroll && typeof s.period.oversold_rsi === 'number') {
        if (s.period.oversold_rsi <= s.options.oversold_rsi && !s.oversold) {
          s.oversold = true
          console.log(('\noversold at ' + s.period.oversold_rsi + ' RSI, preparing to buy\n').cyan)
        }
        else if (s.oversold) {
          s.oversold = false
          s.trend = 'oversold'
          s.signal = 'buy'
          s.cancel_down = true
          return cb()
        }
      }
      if (typeof s.period.trend_ema_rate === 'number') {
        if (s.period.trend_ema_rate > s.options.neutral_rate) {
          if (s.trend !== 'up') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'up'
          s.signal = (!s.options.buy_rate || s.period.trend_ema_rate <= s.options.buy_rate) && (!s.options.max_buy_duration || !s.trend || s.trend_duration <= s.options.max_buy_duration) && !s.acted_on_trend ? 'buy' : null
          s.cancel_down = false
        }
        else if (!s.cancel_down && s.period.trend_ema_rate < (s.options.neutral_rate * -1)) {
          if (s.trend !== 'down') {
            s.acted_on_trend = false
            s.trend_duration = 0
          }
          s.trend_duration++
          s.trend = 'down'
          s.signal = (!s.options.sell_rate || s.period.trend_ema_rate >= s.options.sell_rate) && (!s.options.max_sell_duration || !s.trend || s.trend_duration <= s.options.max_sell_duration) && !s.acted_on_trend ? 'sell' : null
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (typeof s.period.trend_ema_rate === 'number') {
        var color = 'grey'
        if (s.period.trend_ema_rate > s.options.neutral_rate) {
          color = 'green'
        }
        else if (s.period.trend_ema_rate < (s.options.neutral_rate * -1)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[color])
      }
      else {
        cols.push('         ')
      }
      if (s.options.neutral_rate) {
        if (typeof s.period.trend_ema_stddev === 'number') {
          cols.push(z(8, n(s.period.trend_ema_stddev).format('0.0000'), ' ').grey)
        }
        else {
          cols.push('         ')
        }
      }
      return cols
    }
  }
}