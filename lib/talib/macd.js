var t = require('talib')
module.exports = function container (get, set, clear) {
  return function macd (s, options) {
    if (!options) {
      var options = 0
    }
    t.execute({
        name: "MACD",
        startIdx: 0,
        endIdx: s.data.close.length - 1,
        inReal: s.data.close,
        optInFastPeriod: options.macd_fast_period ? options.macd_fast_period: 12,
        optInSlowPeriod: options.macd_slow_period ? options.macd_slow_period: 26,
        optInSignalPeriod: options.macd_signal_period ? options.macd_signal_period: 9,
    }, function (err, result) {
      s.period.macd = result.result
    })
  }
}
