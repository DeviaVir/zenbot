module.exports = function container (get, set, clear) {
  return function sma (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    if (s.lookback.length >= length) {
      var sum = 0
      s.lookback.slice(0, length).forEach(function (period) {
        sum += period[source_key]
      })
      s.period[key] = sum / length
    }
  }
}
