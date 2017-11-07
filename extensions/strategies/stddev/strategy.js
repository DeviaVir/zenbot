var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var tl0mp = []
var tl1mp = []
var tlst0p = []
var tlst1p = []
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '100ms')
      this.option('trendtrades_1', "Trades for trend 1", Number, 1000)
      this.option('trendtrades_2', "Trades for trend 2", Number, 100)
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
      var tl0m = stats.mean(tl0)
      var tl1m = stats.mean(tl1)
      var tlst0 = stats.stdev(tl0)
      var tlst1 = stats.stdev(tl1)
      var tl0s = (tlst0 > tlst0p[0])
      var tl1s = (tlst1 > tlst1p[0])
      var signal = []
      tl0mp.splice(0, 1, tl0m)
      tl1mp.splice(0, 1, tl1m)
      tlst0p.splice(0, 1, tl0s)
      tlst1p.splice(0, 1, tl1s)
      s.A =  tl0s
      s.K = tl1s
    }
},

    onPeriod: function (s, cb) {
            if (
                  s.A === true
                  && s.K === true
               ) {
                  s.signal = 'buy'
               } 
            else if (
                  s.A === false
                  && s.K === false
               ) {
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
