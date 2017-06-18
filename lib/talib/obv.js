var t = require('talib')
module.exports = function container (get, set, clear) {
  /*
   On-Balance Volume
   */
  return function obv (s, key, length) {
    var close = s.lookback.map(function(a) { return a[this.key]}, {key: 'close'});
    close = close.slice(0, length)
    var volume = s.lookback.map(function(a) { return a[this.key]}, {key: 'volume'});
    volume = volume.slice(0, length)
    t.execute({
        name: "OBV",
        startIdx: 0,
        endIdx: close.length - 1,
        inReal: close,
        volume: volume,
    }, function (err, result) {
      var indicator
      s.period[key] = result.result.outReal.slice(-1)[0]
    })
  }
}
