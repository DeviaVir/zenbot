var t = require('talib')
module.exports = function container (get, set, clear) {
  return function macd (s, options) {
    if (!options) {
      var options = 0
    }
    t.execute({
        name: "RSI",
        startIdx: 0,
        endIdx: s.data.close.length - 1,
        inReal: s.data.close,
        optInTimePeriod: options.rsi_periods ? options.rsi_periods: 14,
    }, function (err, result) {
      s.period.rsi = result.result.outReal.slice(-1)[0]
    })
    // console.log(s.period.rsi ? s.period.rsi : null)
    if (s.options.auto_rsi && s.lookback[0]) {
      get('lib.stddev')(s, 'rsi_stddev', Math.floor(s.options.rsi_periods * 7), 'rsi')
      s.options.overbought_rsi = 50 + (1.5 * s.period.rsi_stddev)
      s.options.oversold_rsi = 50 - (1.5 * s.period.rsi_stddev)
    }

  }
}
