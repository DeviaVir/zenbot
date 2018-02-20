var z = require('zero-fill')
  , n = require('numbro')
  , bollinger = require('../../../lib/bollinger')

module.exports = {
  name: 'trend_bollinger',
  description: 'Buy when (Signal ≤ Lower Bollinger Band && trend up) and sell when (Signal ≥ Upper Bollinger Band && trend down).',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '1h')
    this.option('period_length', 'period length, same as --period', String, '1h')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('bollinger_size', 'period size', Number, 20)
    this.option('bollinger_time', 'times of standard deviation between the upper band and the moving averages', Number, 2)
    this.option('bollinger_upper_bound_pct', 'pct the current price should be near the bollinger upper bound before we sell', Number, 0)
    this.option('bollinger_lower_bound_pct', 'pct the current price should be near the bollinger lower bound before we buy', Number, 0)
  },

  calculate: function (s) {
    // calculate Bollinger Bands
    bollinger(s, 'bollinger', s.options.bollinger_size)
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

    if (s.period.bollinger) {
      if (s.period.bollinger.upper && s.period.bollinger.lower) {
        s.signal = null // hold
        let upperBound = s.period.bollinger.upper[s.period.bollinger.upper.length-1]
        let lowerBound = s.period.bollinger.lower[s.period.bollinger.lower.length-1]
        if (s.period.close > (upperBound / 100) * (100 - s.options.bollinger_upper_bound_pct)) {
          s.last_hit_bollinger = 'upper'
        } else if (s.period.close < (lowerBound / 100) * (100 + s.options.bollinger_lower_bound_pct)) {
          s.last_hit_bollinger = 'lower'
        } else {
          if (s.last_hit_bollinger === 'upper' && s.period.close < s.last_hit_close) {
            s.trend = 'down'
          } else if (s.last_hit_bollinger === 'lower' && s.period.close > s.last_hit_close) {
            s.trend = 'up'
          }
          s.last_hit_bollinger = 'middle'
        }
        s.last_hit_close = s.period.close

        if (s.trend === 'down') {
          s.signal = 'sell'
          s.trend = null
        } else if (s.trend === 'up') {
          s.signal = 'buy'
          s.trend = null
        }
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (s.period.bollinger) {
      if (s.period.bollinger.upper && s.period.bollinger.lower) {
        let upperBound = s.period.bollinger.upper[s.period.bollinger.upper.length-1]
        let lowerBound = s.period.bollinger.lower[s.period.bollinger.lower.length-1]
        var color = 'grey'
        if (s.period.close > (upperBound / 100) * (100 - s.options.bollinger_upper_bound_pct)) {
          color = 'green'
        } else if (s.period.close < (lowerBound / 100) * (100 + s.options.bollinger_lower_bound_pct)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.close).format('+00.0000'), ' ')[color])
        cols.push(z(8, n(lowerBound).format('0.000000').substring(0,7), ' ').cyan)
        cols.push(z(8, n(upperBound).format('0.000000').substring(0,7), ' ').cyan)
      }
    }
    else {
      cols.push('         ')
    }
    return cols
  }
}

