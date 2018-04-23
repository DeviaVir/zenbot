
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
  },
  adjust_by_pct: function(pct, n) {
    return n * (pct / 100 + 1)
  },
  pivot: function(s, leftBars, rightBars) {
    let totalBars = leftBars + rightBars + 1,
      periods = [s.period, ...s.lookback.slice(0, totalBars - 1)].reverse(),
      lPeriods = periods.slice(0, leftBars),
      rPeriods = periods.slice(leftBars + 1),
      oPeriods = lPeriods.concat(rPeriods),
      countH = oPeriods.reduce((p, c) => {
        return p + (typeof c.high !== 'undefined' && periods[leftBars].high > c.high ? 1 : 0)
      }, 0),
      countL = oPeriods.reduce((p, c) => {
        return p + (typeof c.low !== 'undefined' && periods[leftBars].low < c.low ? 1 : 0)
      }, 0)
    return {
      high: countH == oPeriods.length ? periods[leftBars].high : null,
      low: countL == oPeriods.length ? periods[leftBars].low : null
    }
  }
}
