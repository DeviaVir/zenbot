var stats = require('stats-lite')
var math = require('mathjs')
var trend = require('trend')
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Trade when % change from last two 1m periods is higher than average.',
    getOptions: function () {
      this.option('period', 'period length', String, '10s')
      this.option('trendtrades_1', "N/A", Number, 100)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "min_periods", Number, 1250)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'trendline', s.options.trendline)
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl1.push(s.lookback[i].close) }

          var chart = tl1

          growth = trend(chart, {
              lastPoints: 3,
              avgPoints: 53,
              avgMinimum: 10,
              reversed: true
         }),
         s.growth = growth
  }
},
    onPeriod: function (s, cb) {
            if (
                  (s.growth < 0.9995)
               ) {
                   s.signal = 'sell'
              }
            else if (
                  (s.growth > 1.0005)
               ) {
                   s.signal = 'buy'
               }
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(s.signal, ' ')[s.signal === 'Sell' ? 'red' : 'green'])
      cols.push(z(s.signal, ' ')[s.signal === 'Buy' ? 'green' : 'red'])
            return cols
      },
    }
  }
