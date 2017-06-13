var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'sar',
    description: 'Parabolic SAR',

    getOptions: function () {
      this.option('period', 'period length', String, '2m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('sar_af', 'acceleration factor for parabolic SAR', Number, 0.015)
      this.option('sar_max_af', 'max acceleration factor for parabolic SAR', Number, 0.3)
    },

    calculate: function (s) {
      if (s.lookback.length >= s.options.min_periods) {
        if (!s.trend) {
          if (s.period.high > s.lookback[s.lookback.length - 1].high) {
            // start with uptrend
            s.trend = 'up'
            s.sar = Math.min(s.lookback[1].low, s.lookback[0].low)
            s.sar_ep = s.period.high
            s.sar_af = s.options.sar_af
            for (var idx = 0; idx < s.lookback.length; idx++) {
              s.sar_ep = Math.max(s.sar_ep, s.lookback[idx].high)
            }
          }
          else {
            s.trend = 'down'
            s.sar = Math.max(s.lookback[1].high, s.lookback[0].high)
            s.sar_ep = s.period.low
            s.sar_af = s.options.sar_af
            for (var idx = 0; idx < s.lookback.length; idx++) {
              s.sar_ep = Math.min(s.sar_ep, s.lookback[idx].low)
            }
          }
        }
      }
    },

    onPeriod: function (s, cb) {
      if (typeof s.sar === 'number') {
        if (s.trend === 'up') {
          s.sar = Math.min(s.lookback[1].low, s.lookback[0].low, s.sar + (s.sar_af * (s.sar_ep - s.sar)))
        }
        else {
          s.sar = Math.max(s.lookback[1].high, s.lookback[0].high, s.sar - (s.sar_af * (s.sar - s.sar_ep)))
        }
        if (s.trend === 'down') {
          if (s.period.high >= s.sar && s.period.close > s.lookback[0].close) {
            s.trend = 'up'
            s.signal = 'buy'
            s.sar_ep = s.period.low
            s.sar_af = s.options.sar_af
            s.sar = Math.min(s.lookback[0].low, s.period.low, s.sar + (s.sar_af * (s.sar_ep - s.sar)))
          }
          else if (s.period.low < s.sar_ep) {
            s.sar_ep = s.period.low
            if (s.sar_af < s.options.sar_max_af) {
              s.sar_af += s.options.sar_af
            }
          }
        }
        else if (s.trend === 'up') {
          if (s.period.low <= s.sar && s.period.close < s.lookback[0].close) {
            s.trend = 'down'
            s.signal = 'sell'
            s.sar_ep = s.period.high
            s.sar_af = s.options.sar_af
            s.sar = Math.max(s.lookback[0].high, s.period.high, s.sar - (s.sar_af * (s.sar - s.sar_ep)))
          }
          else if (s.period.high > s.sar_ep) {
            s.sar_ep = s.period.high
            if (s.sar_af < s.options.sar_max_af) {
              s.sar_af += s.options.sar_af
            }
          }
        }
        if (!s.my_trades.length) {
          s.signal = s.trend === 'up' ? 'buy' : 'sell'
        }
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (typeof s.sar === 'number') {
        cols.push(z(8, n(s.sar).subtract(s.period.close).divide(s.period.close).format('0.00%'), ' ').grey)
      }
      return cols
    }
  }
}
