var z = require('zero-fill')
  , stats = require('stats-lite')
  , math = require('mathjs')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')
  , regression = require('regression')
  , trend = require('trend')
  , n = require('numbro')

module.exports = {
  name: 'trendline',
  description: 'Buy on positive trendline above 1.1 Make sure to set --days when backtesting period.',
  getOptions: function () {
    this.option('period', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period_length', String, '1h')
    this.option('period_length', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period', String, '1h')
    this.option('avgpoints', 'Trades for array 2 to be calculated stddev and mean from', Number, 100)
    this.option('lastpoints', 'Trades for array 2 to be calculated stddev and mean from', Number, 5)
    this.option('min_periods', 'min_periods', Number, 150)
    this.option('order_adjust_time', 'Order Adjust Time', Number, 30000)
    this.option('trend', 'Float number 1-2 would be increasing trend', Number, 1.1)
  },
  calculate: function () {
  },
  onPeriod: function (s, cb) {
    ema(s, 'stddev', s.options.stddev)
    var tl1 = []
    var tls = []
    if (s.lookback[s.options.min_periods]) {
      for (let i = 0; i < s.options.avgpoints + 10; i++) { tl1.push(s.lookback[i].close) }
      for (let i = 0; i < s.options.lastpoints; i++) { tls.push(s.lookback[i].close) }

      var chart = tl1

      var growth = trend(chart, {
        lastPoints: s.options.lastpoints,
        avgPoints: s.options.avgpoints,
        avgMinimum: 0,
        reversed: false
      })
    
      global.direc = growth > s.options.trend
      global.gradient = growth
    }
    if (global.direc === false) {
      s.signal = 'sell'
    }
    else if (global.direc === true) {
      s.signal = 'buy'
    }
	global.oldgrowth = global.gradient
    cb()
  },
  onReport: function (s) {
    var cols = []
    cols.push(z(8, n(global.gradient).format('0.00000000'), ' ')[global.gradient === true ? 'green' : 'red'])
    return cols
  },

  phenotypes: {
    // -- common
    // reference in extensions is given in ms have not heard of an exchange that supports 500ms thru api so setting min at 1 second
    period_length: Phenotypes.RangePeriod(1, 7200, 's'),
    min_periods: Phenotypes.Range(1, 2500),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    // trendtrades_1: Phenotypes.Range(2, 20),
    avgpoints: Phenotypes.Range(10, 10000),
    lastpoints: Phenotypes.Range(10, 10000),
    order_adjust_time: Phenotypes.Range(1000, 100000),
    trend: Phenotypes.RangeFloat(1, 2)
    
  }
}

