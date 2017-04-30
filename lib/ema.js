module.exports = function container (get, set, clear) {
  return function ema (s, key, length) {
    if (s.lookback.length >= length) {
      var prev_ema = s.lookback[0][key]
      if (!prev_ema) {
        var sum = 0
        s.lookback.slice(0, length).forEach(function (period) {
          sum += period.close
        })
        prev_ema = sum / length
      }
      var multiplier = 2 / (length + 1)
      s.period[key] = (s.period.close - prev_ema) * multiplier + prev_ema
    }
  }
}