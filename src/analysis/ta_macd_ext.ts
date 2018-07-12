import { getMaTypeFromString } from '../util/ma-type'
const talib = require('talib')

export default (s, slow_period, fast_period, signal_period, fast_ma_type, slow_ma_type, signal_ma_type) => {
  return new Promise(function(resolve, reject) {
    // create object for talib. only close is used for now but rest might come in handy
    if (!s.marketData) {
      s.marketData = { open: [], close: [], high: [], low: [], volume: [] }
    }

    if (s.lookback.length > s.marketData.close.length) {
      for (var i = s.lookback.length - s.marketData.close.length - 1; i >= 0; i--) {
        s.marketData.close.push(s.lookback[i].close)
      }
    }

    var periods_necessary = slow_period + signal_period - 1
    // Dont calculate until we have enough data

    if (s.marketData.close.length >= periods_necessary) {
      //fillup marketData for talib.
      var tmpMarket = s.marketData.close.slice()

      //add current period
      tmpMarket.push(s.period.close)

      talib.execute(
        {
          name: 'MACDEXT',
          startIdx: 0,
          endIdx: tmpMarket.length - 1,
          inReal: tmpMarket,
          optInFastPeriod: fast_period,
          optInSlowPeriod: slow_period,
          optInSignalPeriod: signal_period,
          optInFastMAType: getMaTypeFromString(fast_ma_type),
          optInSlowMAType: getMaTypeFromString(slow_ma_type),
          optInSignalMAType: getMaTypeFromString(signal_ma_type),
        },
        function(err, result) {
          if (err) {
            reject(err)
            return
          }
          // Result format: (note: outReal  can have multiple items in the array)
          // {
          //   begIndex: 8,
          //   nbElement: 1,
          //   result: { outReal: [ 1820.8621111111108 ] }
          // }
          resolve({
            macd: result.result.outMACD[result.nbElement - 1],
            macd_histogram: result.result.outMACDHist[result.nbElement - 1],
            macd_signal: result.result.outMACDSignal[result.nbElement - 1],
          })
        }
      )
    } else {
      resolve()
    }
  })
}
