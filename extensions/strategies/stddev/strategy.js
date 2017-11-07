var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
var tl0mp = []
var tl1mp = []
var tlst0p = []
var tlst1p = []
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('trendtrades_1', "Trades for trend 1", Number, 60)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "min_periods", Number, 1250)
    },


    calculate: function (s) {
      get('lib.ema')(s, 'stddev', s.options.stddev)
      var tl0 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl0.push(s.lookback[i].close) }
      var tlst0 = stats.stdev(tl0)
      s.devA = tlst0
      s.devB = tlst0 - tlst0p
      tlst0p.slice(0, 1, tlst0)
    }
},

    onPeriod: function (s, cb) {
            if (
                  s.devA > 0
                  && s.devB > 0

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
