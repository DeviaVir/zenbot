import { getMaTypeFromString } from '../util/ma-type'
const talib = require('talib')

export default (s, slow_period, fast_period, signal_period, ma_type) => {
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

    // dont calculate until we have enough data
    let periods_necessary = slow_period + signal_period - 1

    if (s.marketData.close.length < periods_necessary) {
      resolve()
      return
    }

    let tmpMarket = s.marketData.close.slice()

    // add current period
    tmpMarket.push(s.period.close)

    // extract int from string input for ma_type
    let optInMAType = getMaTypeFromString(ma_type)

    talib.execute(
      {
        name: 'PPO',
        startIdx: 0,
        endIdx: tmpMarket.length - 1,
        inReal: tmpMarket,
        optInFastPeriod: fast_period,
        optInSlowPeriod: slow_period,
        optInSignalPeriod: signal_period,
        optInMAType: optInMAType,
      },
      function(err, result) {
        if (err) {
          reject(err)
          return
        }

        resolve(result.result.outReal[result.nbElement - 1])
      }
    )
  })
}
