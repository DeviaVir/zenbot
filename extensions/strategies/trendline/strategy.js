var math = require('mathjs')
var trend = require('trend')
var z = require('zero-fill')
var n = require('numbro')
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Calculate a trendline and trade when trend is positive vs negative.',
    getOptions: function () {
      this.option('period', 'period length', String, '100ms')
      this.option('lastpoints', "Number of trades for short trend average", Number, 100)
      this.option('avgpoints', "Number of trades for long trend average", Number, 1000)
      this.option('min_periods', "avgpoints + 500", Number, 1500)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'trendline', s.options.trendline)
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.min_periods; i++) { tl1.push(s.lookback[i].close) }

          var chart = tl1

          growth = trend(chart, {
              lastPoints: s.options.lastpoints,
              avgPoints: s.options.avgpoints,
              avgMinimum: 10,
              reversed: true
         }),
         s.growth = growth
  }
},
    onPeriod: function (s, cb) {
      if (
         s.growth < 1
         )
         {
         s.signal = 'sell'
         }
      else if (
         s.growth > 1
         )
         {
         s.signal = 'buy'
         }
      cb()
    },
    onReport: function (s) {
      var cols = []
      cols.push(z(8, n(s.growth).format('0.00000'), ' ')[s.growth > 1 ? 'green' : 'red'])
      return cols
    },
  }
}
