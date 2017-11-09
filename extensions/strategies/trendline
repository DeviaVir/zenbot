var stats = require('stats-lite')
var trend = require('trend')
var oldval = []
module.exports = function container (get, set, clear) {
  return {
    name: 'trendline',
    description: 'Trade when % change from last two 1m periods is higher than average.',
    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('trendtrades_1', "Trades - doesnt really matter ATM", Number, 55)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "min_periods", Number, 100)
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
              avgMinimum: 53,
              reversed: true 
         });
         s.diff = growth - oldval[0]
         oldval.slice(0, 1, growth)
         s.growth = growth
  }
},
    onPeriod: function (s, cb) {
            if (
                  (s.diff < 0)
               ) {
                  s.signal = 'sell'
              }
            else if (
                  (s.growth > 1.000000001)
               ) {
                  s.signal = 'buy'
               }
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(s.signal, ' ')[s.signal === false ? 'red' : 'green'])
            return cols
      },
    }
  }
