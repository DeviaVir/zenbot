var talib = require('talib')

module.exports = function stoch(s, key, k_periods, sk_periods, k_ma_type, d_periods, d_ma_type, optMarket) 
{
  return new Promise(function(resolve, reject) {
  

    let tmpMarket = optMarket
    if (!tmpMarket)
    {
      
      tmpMarket = s.lookback.slice(0, 1000)
      tmpMarket.reverse()
      //add current period
      tmpMarket.push(s.period)
    }

    let tmpMarketHigh = tmpMarket.map(x => x.high)
    let tmpMarketClose = tmpMarket.map(x => x.close)
    let tmpMarketLow = tmpMarket.map(x => x.low)


    if (tmpMarket.length >= Math.max(k_periods,d_periods,sk_periods) ) {




      let optInSlowDMAType = getMaTypeFromString(d_ma_type)
      let optInSlowKMAType = getMaTypeFromString(k_ma_type)
      talib.execute({
        name: 'STOCH',
        startIdx:  0 ,
        endIdx: tmpMarketClose.length - 1,
        high:  tmpMarketHigh,
        low: tmpMarketLow,
        close: tmpMarketClose,            
        optInFastK_Period:k_periods, // K 5 default
        optInSlowK_Period:sk_periods, //Slow K 3 default
        optInSlowK_MAType:optInSlowKMAType, //Slow K maType default 0
        optInSlowD_Period:d_periods, // D 3 default
        optInSlowD_MAType:optInSlowDMAType // type of Fast D default 0 

      }, function (err, result) {
        if (err) {
          console.log(err)
          reject(err, result)
          return
        }

        
        resolve({
          k: result.result.outSlowK,
          d: result.result.outSlowD
        })
      })

    }
    else
    { 
      resolve()
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
