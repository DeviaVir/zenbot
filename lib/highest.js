module.exports = function highest(s, key, length) {
  if (s.lookback.length < length) {
    s.period[key] = 0
  } else {
    s.period[key] = s.period[key] = Math.max(s.period.high, ...s.lookback.slice(0, length - 1).map(period => period.high))
  }
}
