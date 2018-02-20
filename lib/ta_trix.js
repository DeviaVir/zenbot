var talib = require('talib')

module.exports = function trix(s, timeperiod) {
  return new Promise(function(resolve, reject) {
    // create object for talib. only close is used for now but rest might come in handy
    if (!s.marketData) {
      s.marketData = { open: [], close: [], high: [], low: [], volume: [] }
    }

    if (s.lookback.length > s.marketData.close.length) {
      for (var i = (s.lookback.length - s.marketData.close.length) - 1; i >= 0; i--) {
        s.marketData.close.push(s.lookback[i].close)
      }
    }

    if (s.marketData.close.length < timeperiod) {
      resolve()
      return
    }

    let tmpMarket = JSON.parse(JSON.stringify(s.marketData.close))

    // add current period
    tmpMarket.push(s.period.close)

    talib.execute({
      name: 'TRIX',
      startIdx: 0,
      endIdx: tmpMarket.length -1,
      inReal: tmpMarket,
      optInTimePeriod: timeperiod
    }, function (err, result) {
      if (err) {
        reject(err, result)
        return
      }

      resolve(result.result.outReal[(result.nbElement - 1)])
    })
  })
}

