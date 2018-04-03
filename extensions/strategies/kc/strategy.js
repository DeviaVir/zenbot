var z = require('zero-fill')
  , n = require('numbro')
  , kc = require('../../../lib/kc')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'kc',
  description: 'Buy when (Signal ≤ Lower Keltner Channel) and sell when (Signal ≥ Upper Keltner Channel).',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '1h')
    this.option('period_length', 'period length, same as --period', String, '1h')
    this.option('kc_size', 'period size', Number, 20)
    this.option('kc_multiplier', 'multiplier for the average true range', Number, 1)
    this.option('kc_upper_channel_pct', 'pct the current price should be near the keltner upper channel before we sell', Number, 0)
    this.option('kc_lower_channel_pct', 'pct the current price should be near the keltner lower channel before we buy', Number, 0)
  },

  calculate: function (s) {
    // calculate Keltner Channels
    kc(s, 'kc', s.options.kc_size)
  },

  onPeriod: function (s, cb) {
    if (s.period.kc) {
      if (s.period.kc.upper && s.period.kc.lower) {
        let upperChannel = s.period.kc.upper[s.period.kc.upper.length-1]
        let lowerChannel = s.period.kc.lower[s.period.kc.lower.length-1]
        if (s.period.close > (upperChannel / 100) * (100 - s.options.kc_upper_channel_pct)) {  
          s.signal = 'sell'
        } else if (s.period.close < (lowerChannel / 100) * (100 + s.options.kc_lower_channel_pct)) {
          s.signal = 'buy'
        } else {
          s.signal = null // hold
        }
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (s.period.kc) {
      if (s.period.kc.upper && s.period.kc.lower) {
        let upperChannel = s.period.kc.upper[s.period.kc.upper.length-1]
        let lowerChannel = s.period.kc.lower[s.period.kc.lower.length-1]
        var color = 'grey'
        if (s.period.close > (upperChannel / 100) * (100 - s.options.kc_upper_channel_pct)) {
          color = 'green'
        } else if (s.period.close < (lowerChannel / 100) * (100 + s.options.kc_lower_channel_pct)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.close).format('+00.0000'), ' ')[color])
        cols.push(z(8, n(lowerChannel).format('0.000000').substring(0,7), ' ').cyan)
        cols.push(z(8, n(upperChannel).format('0.000000').substring(0,7), ' ').cyan)
      }
    }
    else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    kc_size: Phenotypes.Range(1, 40),
    kc_upper_channel_pct: Phenotypes.RangeFloat(-1, 30),
    kc_lower_channel_pct: Phenotypes.RangeFloat(-1, 30)
  }
}

