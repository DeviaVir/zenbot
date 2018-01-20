module.exports = function container(get, set, clear) {
  return function momentum(s, key, length) {
    if (s.period == null || s.lookback == null || s.lookback.length < length) {
      s.period[key] = 0
    } else {
      s.period[key] = s.period.close - s.lookback[length - 1].close
    }
  }
}
