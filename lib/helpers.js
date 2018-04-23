
//Basic Usage
// let crossover = require('../../../lib/helpers').crossover,
// or
// const tv = require('../../../lib/helpers')
// ...
// s.period.hl2 = tv.hl2(s.period)

module.exports = {
  crossover: function(s, key1, key2) {
    return s.period[key1] > s.period[key2] && s.lookback[0][key1] <= s.lookback[0][key2]
  },
  crossunder: function(s, key1, key2) {
    return s.period[key1] < s.period[key2] && s.lookback[0][key1] >= s.lookback[0][key2]
  },
  crossoverVal: function(p1val1, p1val2, p2val1, p2val2) {
    return p1val1 > p1val2 && p2val1 <= p2val2
  },
  crossunderVal: function(p1val1, p1val2, p2val1, p2val2) {
    return p1val1 < p1val2 && p2val1 >= p2val2
  },
  nz: function(src, val = 0) {
    return typeof src != 'number' || isNaN(src) ? val : src
  },
  iff: function(v, r, r2) {
    return v != undefined && v ? r : r2
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
  HAhlc3: function(period, lookback) {
    /*
    xClose = (Open+High+Low+Close)/4
    xOpen = [xOpen(Previous Bar) + xClose(Previous Bar)]/2
    xHigh = Max(High, xOpen, xClose)
    xLow = Min(Low, xOpen, xClose)
    */
    let haClose = (period.open + period.high + period.low + period.close) / 4,
      haClosePeriod = lookback != undefined ? lookback : period,
      haClosePrev = (haClosePeriod.open + haClosePeriod.high + haClosePeriod.low + haClosePeriod.close) / 4,
      haOpen = (period.haOpen ? period.haOpen : period.open + haClosePrev) / 2,
      haHigh = Math.max(period.high, haOpen, haClose),
      haLow = Math.min(period.low, haOpen, haClose)
    // save haOpen
    period.haOpen = haOpen
    return (haClose + haHigh + haLow) / 3
  },
  HAohlc4: function(period, lookback) {
    /*
    xClose = (Open+High+Low+Close)/4
    xOpen = [xOpen(Previous Bar) + xClose(Previous Bar)]/2
    xHigh = Max(High, xOpen, xClose)
    xLow = Min(Low, xOpen, xClose)
    */
    let haClose = (period.open + period.high + period.low + period.close) / 4,
      haClosePeriod = lookback != undefined ? lookback : period,
      haClosePrev = (haClosePeriod.open + haClosePeriod.high + haClosePeriod.low + haClosePeriod.close) / 4,
      haOpen = (period.haOpen ? period.haOpen : period.open + haClosePrev) / 2,
      haHigh = Math.max(period.high, haOpen, haClose),
      haLow = Math.min(period.low, haOpen, haClose)
    // save haOpen
    period.haOpen = haOpen
    return (haClose + haOpen + haHigh + haLow) / 4
  },
  // sample usage: let adjusted_lbks = s.lookback.map((period, i) => tv.src(period, s.options.src, s.lookback[i+1]))
  src: function(src, period, lookback) {
    if (!period)
      throw 'helpers src(). period undefined'

    if (!src || src === 'close') {
      return period.close
    } else if (src === 'hl2') {
      return module.exports.hl2(period)
    } else if (src === 'hlc3') {
      return module.exports.hlc3(period)
    } else if (src === 'ohlc4') {
      return module.exports.ohlc4(period)
    } else if (src === 'HAhlc3') {
      return module.exports.HAhlc3(period, lookback)
    } else if (src === 'HAohlc4') {
      return module.exports.HAohlc4(period, lookback)
    } else
      throw src + ' not supported'
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
