module.exports = function container (get, set, clear) {
  return function typ_price (s, key, length) {
    if (s.lookback[0]) {
      s.period[key] = (s.lookback[0].high + s.lookback[0].low + s.lookback[0].close) / 3
    }
  }
}
