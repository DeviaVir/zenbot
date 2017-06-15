var t = require('talib')
  ,regression = require('regression')

module.exports = function container (get, set, clear) {
   /*
   Returns slope of On-Balance Volume Indicator
   */
  return function obv_slope (s, key, length) {
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
      var obvs = result.result.outReal
      var data = [], i = -1
      while ( obvs[++i] ) {
        data.push( [ i, obvs[i] ] );
      }
      var slope = regression('linear', data);
      s.period[key] = slope.equation[0]
    })
  }
}
