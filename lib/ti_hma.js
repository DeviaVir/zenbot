// Hull Moving Average:
// https://tulipindicators.org/hma

var ti = require('tulind')

module.exports = function hma(s, min_periods, trend_full) {
  return new Promise(function(resolve) {
    if (!s.marketData) {
      s.marketData = { close: [] }
    }

    if (s.lookback.length > s.marketData.close.length) {
      for (var i = (s.lookback.length - s.marketData.close.length) - 1; i >= 0; i--) {
        s.marketData.close.push(s.lookback[i].close)
      }
    }

    if (s.marketData.close.length < min_periods) {
      resolve()
      return
    }

    let tmpClose = s.marketData.close.slice()
    tmpClose.push(s.period.close)

    ti.indicators.hma.indicator([tmpClose], [trend_full], function(err, results) {
      resolve(results[0][results[0].length-1])
    })
  })
}
