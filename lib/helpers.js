
//Basic Usage
// let crossover = require('../../../lib/helpers').crossover,
//or
//const tv = require('../../../lib/helpers')
//...
//s.period.hl2 = tv.hl2(s.period)

module.exports = {
  crossover: function(s, key1, key2) {
    return s.period[key1] > s.period[key2] && s.lookback[0][key1] <= s.lookback[0][key2]
  },
  crossunder: function(s, key1, key2) {
    return s.period[key1] < s.period[key2] && s.lookback[0][key1] >= s.lookback[0][key2]
  },
  nz: function(src, val = 0) {
    return isNaN(src) ? val : src
  },
  iff: function(v, r, r2) {
    return v ? r : r2
  },
  hl2: function(period) {
    return (period.high + period.low) / 2
  },
  hlc3: function(period) {
    return (period.high + period.low + period.close) / 3
  },
  ohlc4: function(period) {
    return (period.open + period.high + period.low + period.close) / 4
  },
  HAohlc4: function(s) {
    let HAclose = (s.period.open + s.period.high + s.period.low + s.period.close) / 4, 
      HAopen = (s.lookback[0].open + s.lookback[0].close) /2,
      HAhigh = Math.max(s.period.high, HAopen, HAclose),
      HAlow = Math.max(s.period.low, HAopen, HAclose)
    return (HAclose + HAopen + HAhigh + HAlow) / 4
  }
}