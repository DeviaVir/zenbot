module.exports = function heikinAshi (s, key) {
  if (s.lookback.length > 0) {
    var prev = s.lookback[0]
    if (typeof prev !== 'undefined') {
      s.period[key] = {
        open: (prev.open + prev.close) / 2,
        high: Math.max(s.period.open, s.period.high, s.period.close),
        low: Math.min(s.period.open, s.period.low, s.period.close),
        close: (s.period.open + s.period.high + s.period.low + s.period.close) / 4,
      }
    }
  }
}
