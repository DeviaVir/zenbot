module.exports = function sma (s, key, length, source_key) {
  if (!source_key) source_key = 'close'
  if (s.lookback.length >= length) {
    let SMA = s.lookback
      .slice(0, length)
      .reduce((sum, cur) => {
        return sum + cur[source_key]
      }, 0)

    s.period[key] = SMA / length
  }
}

