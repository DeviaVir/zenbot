module.exports = function container(get, set, clear) {
  return function srsi(s, key, rsi_length, k, d) {
    get('lib.rsi')(s, 'rsi', rsi_length)
    let RSI = []
    let sum = 0
    if (typeof s.period.rsi !== 'undefined') {
      RSI.push(s.period.rsi)
      s.lookback.slice(0, k).forEach(function (period) {
        if (period.rsi)
          RSI.push(period.rsi)
      })
    }
    let highestRSI = Math.max(...RSI)
    let lowestRSI = Math.min(...RSI)
    let stochK = ((s.period.rsi - lowestRSI) / (highestRSI - lowestRSI)) * 100

    s.lookback.slice(0, d).forEach(period => {
      if (period[key + '_K'])
        sum += period[key + '_K']
    })
    let stochD = sum / d
    s.period[key + '_K'] = stochK
    s.period[key + '_D'] = stochD
  }
}