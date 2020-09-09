module.exports = function momentum(s, key, source_key, length) {
  if (s.lookback == null || s.lookback.length < length || s.period == null || s.period[source_key] == null) {
    s.period[key] = 0
  } else {
    s.period[key] = s.period[source_key] - s.lookback[length - 1][source_key]
  }
}

