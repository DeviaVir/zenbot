var z = require('zero-fill'),
  n = require('numbro')

module.exports = {
  name: 'pivot',
  description: 'Pivot Reversal Strategy',

  getOptions: function () {
    this.option('period_length', 'period length', String, '30m')
    this.option('min_periods', 'min periods', Number, 50)
    this.option('up', 'up', Number, 1)
    this.option('down','down', Number, 1)
  },

  calculate: function (s) {
    if (s.lookback[s.options.min_periods]) {
      if (s.lookback[5].high <= s.lookback[1].high && s.lookback[4].high <= s.lookback[1].high && s.lookback[3].high <= s.lookback[1].high && s.lookback[2].high <= s.lookback[1].high && s.lookback[0].high <= s.lookback[1].high && s.period.high <= s.lookback[1].high) {
        s.pivothigh = s.lookback[1].high
      }
      if (s.lookback[3].low >= s.lookback[1].low && s.lookback[2].low >= s.lookback[1].low && s.lookback[0].low >= s.lookback[1].low && s.period.low >= s.lookback[1].low) {
        s.pivotlow = s.lookback[1].low
      }
    }
  },

  onPeriod: function (s, cb) {
    if (s.lookback[s.options.min_periods]) {
      if (s.period.high / s.pivothigh > s.options.up) {
        if (s.trend != 'up')
        {
          s.signal = 'buy'
        }
        s.trend = 'up'
      }
      if (s.period.low / s.pivotlow < s.options.down) {
        if (s.trend != 'down')
        {
          s.signal = 'sell'
        }
        s.trend = 'down'
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (s.lookback[s.options.min_periods]) {
      cols.push(z(8, n(s.pivothigh), ' '))
      cols.push(z(1, ' '))
      cols.push(z(8, n(s.pivotlow), ' '))
    }
    return cols
  }
}