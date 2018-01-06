var math = require('mathjs')
var trend = require('trend')
var z = require('zero-fill')
var n = require('numbro')
var oldgrowth = 1
var stats = require('stats-lite')
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Calculate a trendline and trade when trend is positive vs negative.',

    getOptions: function () {
      this.option('period', 'period length', String, '30s')
      this.option('period_length', 'period length', String, '30s')
      this.option('lastpoints', "Number of trades for short trend average", Number, 100)
      this.option('avgpoints', "Number of trades for long trend average", Number, 1000)
      this.option('lastpoints2', "Number of trades for short trend average", Number, 10)
      this.option('avgpoints2', "Number of trades for long trend average", Number, 100)
      this.option('min_periods', "Basically avgpoints + a BUNCH of more preroll periods for anything less than 5s period", Number, 15000)
      this.option('markup_sell_pct', "test", Number, 0)
      this.option('markdown_buy_pct', "test", Number, 0)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'trendline', s.options.trendline)
      var tl1 = []
      var tls = []
      var tll = []
      if (s.lookback[s.options.avgpoints + 2000]) {
        for (let i = 0; i < s.options.avgpoints + 1000; i++) { tl1.push(s.lookback[i].close) }
        for (let i = 0; i < s.options.lastpoints; i++) { tls.push(s.lookback[i].close) }
        for (let i = 0; i < s.options.avgpoints; i++) { tll.push(s.lookback[i].close) }

          var chart = tl1

          growth = trend(chart, {
              lastPoints: s.options.lastpoints,
              avgPoints: s.options.avgpoints,
              avgMinimum: 0,
              reversed: true
          }),
          growth2 = trend(chart, {
              lastPoints: s.options.lastpoints2,
              avgPoints: s.options.avgpoints2,
              avgMinimum: 0,
              reversed: true
          }),

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
    },

    onPeriod: function (s, cb) {
      if (
         s.growth === true &&
         s.growth2 === true
         )
         {
         s.signal = 'buy'
         }
      else if (
         s.growth === false ||
         s.growth2 === false ||
         s.accel === false
         )
         {
         s.signal = 'sell'
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
  }
}
