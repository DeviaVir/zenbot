var talib = require('talib')

module.exports = function ta_bollinger(s, key, rsi_periods, DevUp, DevDn, d_ma_type) 
{
  return new Promise(function(resolve, reject) {

    //dont calculate until we have enough data
    if (s.lookback.length >= rsi_periods) {

      let tmpMarket = s.lookback.slice(0, 1000).map(x=>x.close)
      tmpMarket.reverse()
      //add current period
      tmpMarket.push(s.period.close)
    
      //doublecheck length.
      if (tmpMarket.length >= rsi_periods) {
        // extract int from string input for ma_type
        let optInMAType = getMaTypeFromString(d_ma_type)
        talib.execute({
          name: 'BBANDS',
          startIdx: tmpMarket.length-1 ,
          endIdx: tmpMarket.length -1,
          inReal: tmpMarket,
          optInTimePeriod: rsi_periods,  //RSI 14 default
          optInNbDevUp: DevUp, // "Deviation multiplier for upper band" Real Default 2
          optInNbDevDn: DevDn, //"Deviation multiplier for lower band" Real Default 2
          optInMAType:optInMAType // "Type of Moving Average" default 0 

        }, function (err, result) {
          if (err) {
            console.log(err)
            reject(err, result)
            return
          }

          resolve({
            outRealUpperBand: result.result.outRealUpperBand,
            outRealMiddleBand: result.result.outRealMiddleBand,
            outRealLowerBand: result.result.outRealLowerBand
          })

        })
      }
      else {
        reject('MarketLenth not populated enough')
      }
    }
    else{
      reject('MarketLenth not populated enough')
    }
    
  })
}

/**
     * Extract int from string input eg (SMA = 0)
     *
     * @see https://github.com/oransel/node-talib
     * @see https://github.com/markcheno/go-talib/blob/master/talib.go#L20
     */
function getMaTypeFromString(maType) {
  // no constant in lib?
    
  switch (maType.toUpperCase()) {
  case 'SMA':
    return 0
  case 'EMA':
    return 1
  case 'WMA':
    return 2
  case 'DEMA':
    return 3
  case 'TEMA':
    return 4
  case 'TRIMA':
    return 5
  case 'KAMA':
    return 6
  case 'MAMA':
    return 7
  case 'T3':
    return 8
  default:
    return 0
  }
}
