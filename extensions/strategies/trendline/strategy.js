var stats = require('stats-lite')
var math = require('mathjs')
var trend = require('trend')
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Trade when % change from last two 1m periods is higher than average.',
    getOptions: function () {
      this.option('period', 'period length', String, '10s')
      this.option('trendtrades_1', "Number of trades to load into data", Number, 100)
      this.option('lastpoints', "Number of short points at beginning of trendline", Number, 3)
      this.option('avgpoints', "Number of long points at end of trendline", Number,  53)
      this.option('min_periods', "Minimum trades to backfill with (trendtrades_1 + about ~10)", Number, 1250)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'trendline', s.options.trendline)
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl1.push(s.lookback[i].close) }

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
                  (s.growth < 0.9991)
               ) {
                   s.signal = 'sell'
              }
            else if (
                  (s.growth > 1.0001)
               ) {
                   s.signal = 'buy'
               }
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(s.signal, ' ')[s.signal === 'Sell' ? 'red' : 'green'])
      return cols
      },
    }
  }
