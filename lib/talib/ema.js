var t = require('talib')
module.exports = function container (get, set, clear) {
  /*
   Exponential Moving Average
   */
  return function ema (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    var data = s.lookback.map(function(a) { return a[this.key]}, {key: source_key});
    data = data.slice(0, length)
    t.execute({
        name: "EMA",
        startIdx: 0,
        endIdx: data.length - 1,
        inReal: data,
        optInTimePeriod: length,
    }, function (err, result) {
      var indicator
      s.period[key] = result.result.outReal.slice(-1)[0]
    })
  }
}
