let math = require('mathjs')
  , trend = require('trend')
  , z = require('zero-fill')
  , n = require('numbro')
  , stats = require('stats-lite')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')
var oldgrowth = 1

module.exports = {
  name: 'trendline',
  description: 'Calculate a trendline and trade when trend is positive vs negative.',

  getOptions: function () {
    this.option('period', 'period length', String, '30s')
    this.option('periodLength', 'period length', String, '30s')
    this.option('lastpoints', 'Number of trades for short trend average', Number, 100)
    this.option('avgpoints', 'Number of trades for long trend average', Number, 1000)
    this.option('lastpoints2', 'Number of trades for short trend average', Number, 10)
    this.option('avgpoints2', 'Number of trades for long trend average', Number, 100)
    this.option('min_periods', 'Basically avgpoints + a BUNCH of more preroll periods for anything less than 5s period', Number, 15000)
    this.option('markup_sell_pct', 'test', Number, 0)
    this.option('markdown_buy_pct', 'test', Number, 0)
  },

  calculate: function () {

  },

  onPeriod: function (s, cb) {
    ema(s, 'trendline', s.options.trendline)
    var tl1 = []
    var tls = []
    var tll = []
    if (s.lookback[s.options.avgpoints + 2000]) {
      for (let i = 0; i < s.options.avgpoints + 1000; i++) { tl1.push(s.lookback[i].close) }
      for (let i = 0; i < s.options.lastpoints; i++) { tls.push(s.lookback[i].close) }
      for (let i = 0; i < s.options.avgpoints; i++) { tll.push(s.lookback[i].close) }

      var chart = tl1

      var growth = trend(chart, {
        lastPoints: s.options.lastpoints,
        avgPoints: s.options.avgpoints,
        avgMinimum: 0,
        reversed: true
      })
      var growth2 = trend(chart, {
        lastPoints: s.options.lastpoints2,
        avgPoints: s.options.avgpoints2,
        avgMinimum: 0,
        reversed: true
      })

      s.stats = growth
      s.growth = growth > 1
      s.stats2 = growth2
      s.growth2 = growth2 > 1
      s.stdevs = stats.stdev(tls)
      s.stdevl = stats.stdev(tll)
      s.means = math.mean(tls)
      s.meanl = math.mean(tll)
      s.pcts = s.stdevs / s.means
      s.pctl = s.stdevl / s.meanl
      s.options.markup_sell_pct = math.mean(s.pcts, s.pctl) * 100
      s.options.markdown_buy_pct = math.mean(s.pcts, s.pctl) * 100
      s.accel = growth > oldgrowth
      oldgrowth = growth
    }

    if (
      s.growth === true &&
         s.growth2 === true
    )
    {
      s.signal = 'buy'
    }
    else if (
      s.growth === false |
         s.growth2 === false |
         s.accel === false
    )
    {
      //s.signal = 'sell'
    }
    cb()
  },
  onReport: function (s) {
    var cols = []
    cols.push(' ')
    cols.push(z(8, n(s.stats).format('0.00000000'), ' ')[s.growth === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.stats2).format('0.00000000'), ' ')[s.growth2 === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.stdevs).format('0.00000000'), ' ')[s.accel === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.stdevl).format('0.00000000'), ' ')[s.accel === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.means).format('0.00000000'), ' ')[s.accel === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.meanl).format('0.00000000'), ' ')[s.accel === true ? 'green' : 'red'])
    cols.push(' ')
    cols.push(z(8, n(s.options.markup_sell_pct).format('0.00000000'), ' ')[s.accel === true ? 'green' : 'red'])
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 400, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    lastpoints: Phenotypes.Range(20, 500),
    avgpoints: Phenotypes.Range(300, 3000),
    lastpoints2: Phenotypes.Range(5, 300),
    avgpoints2: Phenotypes.Range(50, 1000),
  }
}
