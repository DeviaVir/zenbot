var z = require('zero-fill'),
n = require('numbro'),
highest = require('../../../lib/highest'),
lowest = require('../../../lib/lowest'),
Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'ichimoku',
  description: 'Ichimoku Cloud',

  getOptions: function () {
    this.option('period_length', 'period length', String, '4h')
    this.option('min_periods', 'min periods (should be >= senkou_b option)', Number, 52)
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

      // The below lines cause the bot to buy when the price is above the kumo cloud and sell when the price is inside
      // or below the kumo cloud. There are many different ways to trade the Ichimoku Cloud and all of them can be
      // implemented using the indicators above.

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
  },

  phenotypes: {
    //General Options
    period_length: Phenotypes.RangePeriod(5, 120, 'm'),
    min_periods: Phenotypes.Range(150, 150), //(should be >= senkou_b option)
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    //Strategy Specific
    tenkan: Phenotypes.RangeFactor(5, 30, 1),
    kijun: Phenotypes.RangeFactor(25, 75, 1),
    senkou_b: Phenotypes.RangeFactor(50, 150, 1),
    chikou: Phenotypes.RangeFactor(20, 40, 1)
  }
}
