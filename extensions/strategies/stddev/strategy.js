var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
var tl0mp = []
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '100ms')
      this.option('trendtrades_1', "Trades for trend 1", Number, 2500)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "min_periods", Number, 3000)
    },


    calculate: function (s) {
      get('lib.ema')(s, 'stddev', s.options.stddev)
      var tl0 = []
      if (s.lookback[s.options.trendtrades_1]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl0.push(s.lookback[i].close) }
      s.tlst0 = stats.stdev(tl0)
      s.mean = math.mean(tl0)
      s.sign = s.mean - s.tlst0
      s.sig = tl0[0] - s.sign
    }
},

    onPeriod: function (s, cb) {
            if (
                  s.sig > 0

               ) {
                  s.signal = 'buy'
               }
             else {
                  s.signal = 'sell'
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
