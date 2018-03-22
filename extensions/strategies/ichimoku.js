var z = require('zero-fill'),
n = require('numbro'),
highest = require('../../../lib/highest'),
lowest = require('../../../lib/lowest')

module.exports = {
  name: 'ichimoku',
  description: 'Ichimoku Cloud',

  getOptions: function () {
    this.option('period_length', 'period length', String, '4h')
    this.option('min_periods', 'min periods', Number, 56)
    this.option('tenkan', 'Tenkan (conversion) line', Number, 9)
    this.option('kijun','Kijun (base) line', Number, 26)
    this.option('senkou_b','Senkou (leading) span B', Number, 52)
    this.option('chikou','Chikou (lagging) span)', Number, 26)
  },

  calculate: function (s) {
  },

  onPeriod: function (s, cb) {
    if (s.lookback[s.options.min_periods]) {
      highest(s, 'tenkan_high', s.options.tenkan)
      lowest(s, 'tenkan_low', s.options.tenkan)
      highest(s, 'kijun_high', s.options.kijun)
      lowest(s, 'kijun_low', s.options.kijun)
      highest(s, 'senkou_high', s.options.senkou_b)
      lowest(s, 'senkou_low', s.options.senkou_b)

      s.period.tenkan = ((s.period.tenkan_high + s.period.tenkan_low) / 2)
      s.period.kijun = ((s.period.kijun_high + s.period.kijun_low) / 2)
      s.period.senkou_a = ((s.period.tenkan + s.period.kijun) / 2)
      s.period.senkou_b = ((s.period.senkou_high + s.period.senkou_low) / 2)
      s.period.chikou = s.lookback[s.options.chikou - 1].close

      if (s.period.close > Math.max(s.period.senkou_a, s.period.senkou_b)) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      }
      if (s.period.close < Math.max(s.period.senkou_a, s.period.senkou_b)) {
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
    return cols
  }
}
