module.exports = function container (get, set, clear) {
  return function dema (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    if (s.lookback.length >= length) {
      var prev_ema = s.lookback[0][key]
      if (!prev_ema) {
        //SMA
        var sum = 0
        s.lookback.slice(0, length).forEach(function (period) {
          sum += period[source_key]
        })
        prev_ema = sum / length
      }
      var multiplier = 2 / (length + 1)
      var this_ema = ((s.period[source_key] - prev_ema) * multiplier + prev_ema)
      var ema_ema = ((s.period[source_key] - this_ema) * multiplier + this_ema)
      s.period[key] = (2 * this_ema) - ema_ema
    }
  }
}
