var z = require('zero-fill')
var stat = require('stats-lite')
var n = require('numbro')
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev1',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '1m')
      this.option('min_periods', 'min. number of history periods', Number, 1000)
      this.option('meas', 'measurements', Number, 25)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'speed', s.options.speed)
      if (s.lookback[s.options.meas]) {
        var arr = []
        var i = s.options.meas
        while (--i) arr.push(s.lookback[i].close);
        s.dev = stat.stdev(arr)
        s.meany = stat.mean(arr)
        s.closep = s.lookback[0].close
        s.diffpm = s.closep - s.meany
        if (
                (Math.abs(s.diffpm) > s.dev)
                && (Math.abs(s.diffpm) === s.diffpm)
        ) {
                s.trending_up = true;
        } else if (
                (Math.abs(s.diffpm) > s.dev)
                && (Math.abs(s.diffpm) !== s.diffpm)
        ) {
                s.trending_up = false; //literally: direction down
        }
     }
     if (s.trending_up == true) {
       s.signal = 'buy'
     }
     else if (s.trending_up == false) {
       s.signal = 'sell'
     }
    },

    onPeriod: function (s, cb) {
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(8, n(s.diffpm).format('0.0000'), ' ')[s.diffpm > 0 ? 'green' : 'red'])
      cols.push(z(8, n(s.diffpm).format('0.0000'), ' ')[s.diffpm < 0 ? 'red' : 'green'])
      return cols
    }
  }
}
