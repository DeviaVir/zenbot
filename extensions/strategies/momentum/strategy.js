let z = require('zero-fill')
  , n = require('numbro')
  , momentum = require('../../../lib/momentum')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'momentum',
  description: 'MOM = Close(Period) - Close(Length)',

  getOptions: function () {
    this.option('momentum_size', 'number of periods to look back for momentum', Number, 5)
  },

  calculate: function (s) {
    if (s.in_preroll) { return }
    momentum(s, 'mom0', 'close', s.options.momentum_size)
    momentum(s, 'mom1', 'mom0', 1)
  },

  onPeriod: function (s, cb) {
    if (s.in_preroll) {
      cb()
      return
    }

    if (s.period.mom0 > 0 && s.period.mom1 > 0) {
      s.signal = 'buy'
    }
    if (s.period.mom0 < 0 && s.period.mom1 < 0) {
      s.signal = 'sell'
    }
    cb()
  },

  onReport: function (s) {
    let cols = [], color
    if (s.period.mom0 != null) {
      color = s.period.mom0 < 0 ? 'red' : s.period.mom0 > 0 ? 'green' : 'grey'
      cols.push(z(5, n(s.period.mom0).format('000'), ' ')[color])
    } else {
      cols.push(' '.repeat(5))
    }
    if (s.period.mom1 != null) {
      color = s.period.mom1 < 0 ? 'red' : s.period.mom1 > 0 ? 'green' : 'grey'
      cols.push(z(5, n(s.period.mom1).format('000'), ' ')[color])
    } else {
      cols.push(' '.repeat(5))
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 2500),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    momentum_size: Phenotypes.Range(1,20)
  }
}

