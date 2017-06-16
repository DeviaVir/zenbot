var t = require('talib')
  ,regression = require('regression')

module.exports = function container (get, set, clear) {
   /*
   Linear Slope of Average Directional Index:
   An indicator that tracks the relationship between volume and price.
   It is often considered a leading indicator because it shows when a
   stock is being accumulated or distributed, foreshadowing major price moves.
   */

  return function ads (s, key, length) {
    var close = s.lookback.map(function(a) { return a[this.key]}, {key: 'close'});
    close = close.slice(0, length)
    var volume = s.lookback.map(function(a) { return a[this.key]}, {key: 'volume'});
    volume = volume.slice(0, length)
    var high = s.lookback.map(function(a) { return a[this.key]}, {key: 'high'});
    high = high.slice(0, length)
    var low = s.lookback.map(function(a) { return a[this.key]}, {key: 'low'});
    low = low.slice(0, length)
    t.execute({
        name: "AD",
        startIdx: 0,
        endIdx: close.length - 1,
        high: high,
        low: low,
        close: close,
        volume: volume

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
