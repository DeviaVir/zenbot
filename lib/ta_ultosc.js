var talib = require('talib')

module.exports = function ultosc(s, min_periods, timeperiod1, timeperiod2, timeperiod3) {
  return new Promise(function(resolve, reject) {
    // create object for talib. only close is used for now but rest might come in handy
    if (!s.marketData) {
      s.marketData = { open: [], close: [], high: [], low: [], volume: [] }
    }

    if (s.lookback.length > s.marketData.close.length) {
      for (var i = (s.lookback.length - s.marketData.close.length) - 1; i >= 0; i--) {
        s.marketData.high.push(s.lookback[i].high)
        s.marketData.low.push(s.lookback[i].low)
        s.marketData.close.push(s.lookback[i].close)
      }
    }

    if (s.marketData.close.length < min_periods) {
      resolve()
      return
    }

    let tmpHigh = s.marketData.high.slice()
    tmpHigh.push(s.period.high)

    let tmpLow = s.marketData.low.slice()
    tmpLow.push(s.period.low)

    let tmpClose = s.marketData.close.slice()
    tmpClose.push(s.period.close)

    talib.execute({
      name: 'ULTOSC',
      startIdx: 0,
      endIdx: tmpHigh.length -1,
      high: tmpHigh,
      low: tmpLow,
      close: tmpClose,
      optInTimePeriod1: timeperiod1,
      optInTimePeriod2: timeperiod2,
      optInTimePeriod3: timeperiod3,
    }, function (err, result) {
      if (err) {
        reject(err, result)
        return
      }

      resolve(result.result.outReal[(result.nbElement - 1)])
    })
  })
}

