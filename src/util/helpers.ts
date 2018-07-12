//Basic Usage
// let crossover = require('../../../lib/helpers').crossover,
// or
// const tv = require('../../../lib/helpers')
// ...
// s.period.hl2 = tv.hl2(s.period)

export const crossover = (s, key1, key2) => {
  return s.period[key1] > s.period[key2] && s.lookback[0][key1] <= s.lookback[0][key2]
}

export const crossunder = (s, key1, key2) => {
  return s.period[key1] < s.period[key2] && s.lookback[0][key1] >= s.lookback[0][key2]
}

export const crossoverVal = (p1val1, p1val2, p2val1, p2val2) => {
  return p1val1 > p1val2 && p2val1 <= p2val2
}

export const crossunderVal = (p1val1, p1val2, p2val1, p2val2) => {
  return p1val1 < p1val2 && p2val1 >= p2val2
}

export const nz = (src, val = 0) => {
  return typeof src != 'number' || isNaN(src) ? val : src
}

export const iff = (v, r, r2) => {
  return v != undefined && v ? r : r2
}

export const hl2 = (period) => {
  return (period.high + period.low) / 2
}

export const hlc3 = (period) => {
  return (period.high + period.low + period.close) / 3
}

export const ohlc4 = (period) => {
  return (period.open + period.high + period.low + period.close) / 4
}

export const HAhlc3 = (period, lookback?) => {
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
}

export const HAohlc4 = (period, lookback?) => {
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
}

// sample usage: let adjusted_lbks = s.lookback.map((period, i) => tv.src(period, s.options.src, s.lookback[i+1]))
export const src = (src, period, lookback) => {
  if (!period) throw 'helpers src(). period undefined'

  if (!src || src === 'close') {
    return period.close
  } else if (src === 'hl2') {
    return hl2(period)
  } else if (src === 'hlc3') {
    return hlc3(period)
  } else if (src === 'ohlc4') {
    return ohlc4(period)
  } else if (src === 'HAhlc3') {
    return HAhlc3(period, lookback)
  } else if (src === 'HAohlc4') {
    return HAohlc4(period, lookback)
  } else throw src + ' not supported'
}

export const adjust_by_pct = (pct, n) => {
  return n * (pct / 100 + 1)
}

export const pivot = (s, leftBars, rightBars) => {
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
    low: countL == oPeriods.length ? periods[leftBars].low : null,
  }
}
