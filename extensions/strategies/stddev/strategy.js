var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Buy when standard deviation and mean increase, sell on mean decrease.',
    getOptions: function () {
      this.option('period', 'period length, set poll trades to 100ms, poll order 1000ms', String, '1s')
      this.option('trendtrades_1', "Trades for array 1 to be subtracted stddev and mean from", Number, 100)
      this.option('min_periods', "min_periods", Number, 3000)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'stddev', s.options.stddev)
      var tl0 = []
      var tl1 = []
      if (s.lookback[s.options.trendtrades_1 + 500]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl0.push(s.lookback[i].close) }
          s.std0 = stats.stdev(tl0)
          s.mean0 = math.mean(tl0)
          s.low = tl0[0] - s.std0
          s.high = tl0[0] + s.std0
          s.buylow = s.mean0 < s.low
          s.sellhigh = s.mean0 > s.high
    }
  },
    onPeriod: function (s, cb) {
      if (
         s.sellhigh === true
         )
         {
         s.signal = 'sell'
         }
      if (
         s.buylow === true
         )
         {
         s.signal = 'buy'
         }
    cb()
  },
    onReport: function (s) {
      var cols = []
      cols.push(z(8, n(s.mean0).format('0.00000')))
      cols.push('  ')
      cols.push(z(8, n(s.std0).format('0.00000')))
      return cols
    },
  }
}
