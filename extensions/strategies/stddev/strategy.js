var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev',
    description: 'Buy when standard deviation and mean increase, sell on mean decrease.',
    getOptions: function () {
      this.option('period', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period_length', String, '100ms')
      this.option('period_length', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period', String, '100ms')
      this.option('trendtrades_1', "Trades for array 1 to be subtracted stddev and mean from", Number, 5)
      this.option('trendtrades_2', "Trades for array 2 to be calculated stddev and mean from", Number, 53)
      this.option('min_periods', "min_periods", Number, 1250)
    },
    calculate: function (s) {
      calculated = null
    },
    onPeriod: function (s, cb) {
      get('lib.ema')(s, 'stddev', s.options.stddev)
      var tl0 = []
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl0.push(s.lookback[i].close) }
          for (let i = 0; i < s.options.trendtrades_2; i++) { tl1.push(s.lookback[i].close) }
          s.std0 = stats.stdev(tl0) / 2
          s.std1 = stats.stdev(tl1) / 2
          s.mean0 = math.mean(tl0)
          s.mean1 = math.mean(tl1)
          s.sig0 = s.std0 > s.std1 ? 'Up' : 'Down';
          s.sig1 = s.mean0 > s.mean1 ? 'Up' : 'Down';
      }
      if (s.sig1 === 'Down') {
          s.signal = 'sell'
      }
      else if (s.sig0 === 'Up' && s.sig1 === 'Up') {   
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
