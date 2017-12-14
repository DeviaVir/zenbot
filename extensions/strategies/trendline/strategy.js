var math = require('mathjs')
var trend = require('trend')
var z = require('zero-fill')
var n = require('numbro')
var oldgrowth = 1
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Calculate a trendline and trade when trend is positive vs negative.',
    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('lastpoints', "Number of trades for short trend average", Number, 100)
      this.option('avgpoints', "Number of trades for long trend average", Number, 1000)
      this.option('lastpoints2', "Number of trades for short trend average", Number, 10)
      this.option('avgpoints2', "Number of trades for long trend average", Number, 100)
      this.option('min_periods', "Basically avgpoints + a BUNCH of more preroll periods for anything less than 5s period", Number, 5000)
      this.option('max_sell_loss_pct', "Max Sell loss Pct", Number, 0)
      this.option('markup_pct', "Default Strategy Markup - Hard In The Paint Mode", Number, 0.01)

    },
    calculate: function (s) {
      get('lib.ema')(s, 'trendline', s.options.trendline)
      var tl1 = []
      if (s.lookback[(s.options.min_periods)]) {
        for (let i = 0; i < (s.options.min_periods); i++) { tl1.push(s.lookback[i].close) }
          var chart = tl1
          growth = trend(chart, {
              lastPoints: s.options.lastpoints,
              avgPoints: s.options.avgpoints,
              avgMinimum: 10,
              reversed: true
         }),
          growth2 = trend(chart, {
              lastPoints: s.options.lastpoints2,
              avgPoints: s.options.avgpoints2,
              avgMinimum: 10,
              reversed: true
         }),
         s.stats = growth
         s.growth = growth > 1
         s.stats2 = growth2
         s.growth2 = growth2 > 1
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
         s.growth === false |
         s.growth2 === false
         )
         {
         s.signal = 'sell'
         }
      cb()
    },
    onReport: function (s) {
      var cols = []
      cols.push('  ')
      cols.push(z(8, n(s.stats).format('0.00000'), ' ')[s.stats > 1 ? 'green' : 'red'])
      cols.push('  ')
      cols.push(z(8, n(s.stats2).format('0.00000'), ' ')[s.stats2 > 1 ? 'green' : 'red'])
      cols.push('  ')
      return cols
    },
  }
}
