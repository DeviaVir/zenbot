module.exports = function lowest(s, key, length) {
  if (s.lookback.length < length) {
    s.period[key] = 0
  } else {
    s.period[key] = s.period[key] = Math.min(s.period.low, ...s.lookback.slice(0, length - 1).map(period => period.low))
  }
}
