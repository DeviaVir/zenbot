
var t = require('talib')
module.exports = function container (get, set, clear) {
  return function macd (s, options) {
    if (!options) {
      var options = 0
    }
    t.execute({
      name: "ADX",
      startIdx: 0,
      endIdx: s.data.close.length - 1,
      high: s.data.high,
      low: s.data.low,
      close: s.data.close,
      optInTimePeriod: options.adx_period ? options.adx_period : 20,
    }, function (err, result) {
        s.period.adx = result.result.outReal
    });
  }
}
