var z = require('zero-fill')
  , n = require('numbro')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'speed',
  description: 'Trade when % change from last two 1m periods is higher than average.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '1m')
    this.option('period_length', 'period length, same as --period', String, '1m')
    this.option('min_periods', 'min. number of history periods', Number, 3000)
    this.option('baseline_periods', 'lookback periods for volatility baseline', Number, 3000)
    this.option('trigger_factor', 'multiply with volatility baseline EMA to get trigger value', Number, 1.6)
  },

  calculate: function (s) {
    if (s.lookback[1]) {
      s.period.speed = (s.period.close - s.lookback[1].close) / s.lookback[1].close * 100
      s.period.abs_speed = Math.abs((s.period.close - s.lookback[1].close) / s.lookback[1].close * 100)
      if (s.lookback[s.options.baseline_periods + 1]) {
        ema(s, 'baseline', s.options.baseline_periods, 'abs_speed')
      }
    }
  },

  onPeriod: function (s, cb) {
    if (typeof s.period.baseline === 'number') {
      if (s.period.speed >= s.period.baseline * s.options.trigger_factor) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      }
      else if (s.period.speed <= s.period.baseline * s.options.trigger_factor * -1) {
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
    cols.push(z(8, n(s.period.speed).format('0.0000'), ' ')[s.period.speed >= 0 ? 'green' : 'red'])
    if (typeof s.period.baseline === 'number') {
      cols.push(z(8, n(s.period.baseline).format('0.0000'), ' ').grey)
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 100),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    baseline_periods: Phenotypes.Range(1, 5000),
    trigger_factor: Phenotypes.RangeFloat(0.1, 10)
  }
}

