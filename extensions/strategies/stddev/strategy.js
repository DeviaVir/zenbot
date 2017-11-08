var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Trade when % change from last two 1m periods is higher than average.',
    getOptions: function () {
      this.option('period', 'period length', String, '100ms')
      this.option('trendtrades_1', "Trades for trend 1", Number, 50)
      this.option('trendtrades_2', "Trades for trend 1", Number, 100)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "min_periods", Number, 1250)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'stddev', s.options.stddev)
      var tl0 = []
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl0.push(s.lookback[i].close) }
          for (let i = 0; i < s.options.trendtrades_2; i++) { tl1.push(s.lookback[i].close) }
          s.std0 = stats.stdev(tl0)
          s.std1 = stats.stdev(tl1)
   }
},
    onPeriod: function (s, cb) {
            if (
                  s.std0 < 0
               ) {
                  s.signal = 'sell'
               }
            else if (
                  s.std0 > 0
                  && s.std1 > 0
               ) {
                  s.signal = 'buy'
               }
      cb()
    },
    onReport: function (s) {
      var cols = []
      cols.push(z(s.signal, ' ')[s.signal == 'sell' ? 'red' : 'green'])
            return cols
      },
    }
  }
