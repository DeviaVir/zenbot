module.exports = function container (get, set, clear) {
  /*
   Simple Moving Average
   */
  return function sma (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    if (s.lookback.length >= length) {
      var sum = 0
      /*console.log('s.lookback.length:', s.lookback.length )

      var tx = s.lookback[0][source_key]
      var time_key = 'time'
      var t1 = s.lookback[0][time_key]
      var t2 = s.lookback[length-1][time_key]
      //console.log('t1-t2:', t1, '---', t2)
      */
      s.lookback.slice(0, length).forEach(function (period) {
        sum += period[source_key]
      })
      s.period[key] = sum/length
      //console.log('sma:', sum/length)
    }
  }
}
