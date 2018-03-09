var talib = require('talib')

module.exports = function macd (s, slow_period, fast_period, signal_period) {
  return new Promise(function(resolve, reject) {
    // check parameters
    // if (fast_period > slow_period) {
    //   console.log('incorrect parameters MACD. (fast_period < slow_period || signal_period > fast_period)')
    //   return;
    // }

    //create object for talib. only close is used for now but rest might come in handy
    if (!s.marketData) {
      s.marketData = { open: [], close: [], high: [], low: [], volume: [] }
    }
    if (s.lookback.length > s.marketData.close.length) {
      for (var i = (s.lookback.length - s.marketData.close.length) - 1; i >= 0; i--) {
        s.marketData.close.push(s.lookback[i].close)
      }
    }

    let periods_necessary = slow_period + signal_period - 1
    //dont calculate until we have enough data

    if (s.marketData.close.length >= periods_necessary) {
      // fillup marketData for talib.
      let tmpMarket = s.marketData.close.slice()

      // add current period
      tmpMarket.push(s.period.close)

      talib.execute({
        name: 'MACD',
        startIdx: 0,
        endIdx: tmpMarket.length - 1,
        inReal: tmpMarket,
        optInFastPeriod: fast_period,
        optInSlowPeriod: slow_period,
        optInSignalPeriod: signal_period
      }, function (err, result) {
        if (err) {
          reject(err)
          console.log(err)
          return
        }
        //Result format: (note: outReal  can have multiple items in the array)
        // {
        //   begIndex: 8,
        //   nbElement: 1,
        //   result: { outReal: [ 1820.8621111111108 ] }
        // }
        resolve({
          'macd': result.result.outMACD[(result.nbElement - 1)],
          'macd_histogram': result.result.outMACDHist[(result.nbElement - 1)],
          'macd_signal': result.result.outMACDSignal[(result.nbElement - 1)],
        })
      })
    } else {
      resolve()
    }
  })
}
