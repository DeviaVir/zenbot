module.exports = function container (get, set, clear) {
  return function sma (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    if (s.lookback.length >= length) {
      var prev_sma = s.lookback[0][key]
      if (typeof prev_sma === 'undefined' || isNaN(prev_sma)) {
        var sum = 0
        s.lookback.slice(0, length).forEach(function (period) {
          sum += period[source_key]
        })
        prev_sma = sum / length
      }
      s.period[key] = prev_sma
    }
  }
}
